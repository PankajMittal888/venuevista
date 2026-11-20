import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from apps.events.models import Event
from apps.seating.models import SeatingSection, Seat

User = get_user_model()


@pytest.mark.django_db
class TestSeatingManagement:
    def setup_method(self):
        self.client = APIClient()
        self.producer = User.objects.create_user(
            username="seatproducer",
            email="seatproducer@example.com",
            password="Password123!",
            role="PRODUCER"
        )
        self.attendee = User.objects.create_user(
            username="seatattendee",
            email="seatattendee@example.com",
            password="Password123!",
            role="ATTENDEE"
        )
        now = timezone.now()
        self.event = Event.objects.create(
            producer=self.producer,
            title="Opera Gala",
            category="THEATER",
            venue="Grand Opera House",
            address="10 Opera Blvd",
            start_time=now + timedelta(days=7),
            end_time=now + timedelta(days=7, hours=3),
            capacity=200,
            status="PUBLISHED"
        )

    def test_producer_create_section_and_generate_seats(self):
        self.client.force_authenticate(user=self.producer)
        # Create section
        sec_payload = {
            "event": self.event.id,
            "name": "Orchestra",
            "description": "Front ground level"
        }
        res = self.client.post("/api/seating/sections/", sec_payload, format="json")
        assert res.status_code == status.HTTP_201_CREATED
        section_id = res.data["id"]

        # Generate seats: rows A and B, 5 seats each (10 seats total)
        gen_payload = {
            "rows": ["A", "B"],
            "seats_per_row": 5
        }
        gen_res = self.client.post(f"/api/seating/sections/{section_id}/generate-seats/", gen_payload, format="json")
        assert gen_res.status_code == status.HTTP_201_CREATED
        assert Seat.objects.filter(section_id=section_id).count() == 10

    def test_attendee_can_view_seats(self):
        section = SeatingSection.objects.create(event=self.event, name="Balcony")
        Seat.objects.create(section=section, row="A", seat_number="1", status=Seat.Status.AVAILABLE)
        Seat.objects.create(section=section, row="A", seat_number="2", status=Seat.Status.BOOKED)

        self.client.force_authenticate(user=self.attendee)
        res = self.client.get(f"/api/seating/seats/?section={section.id}&status=AVAILABLE")
        assert res.status_code == status.HTTP_200_OK
        results = res.data.get("results") if isinstance(res.data, dict) else res.data
        assert len(results) == 1
        assert results[0]["seat_number"] == "1"
