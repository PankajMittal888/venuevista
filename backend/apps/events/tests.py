import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from apps.events.models import Event

User = get_user_model()


@pytest.mark.django_db
class TestEventManagement:
    def setup_method(self):
        self.client = APIClient()
        self.producer = User.objects.create_user(
            username="producer1",
            email="producer1@example.com",
            password="Password123!",
            role="PRODUCER"
        )
        self.attendee = User.objects.create_user(
            username="attendee1",
            email="attendee1@example.com",
            password="Password123!",
            role="ATTENDEE"
        )

    def test_producer_create_event(self):
        self.client.force_authenticate(user=self.producer)
        now = timezone.now()
        payload = {
            "title": "Grand Music Festival",
            "description": "An electrifying night of live music.",
            "category": "CONCERT",
            "venue": "Metro Arena",
            "address": "123 Concert Way, Cityville",
            "start_time": (now + timedelta(days=5)).isoformat(),
            "end_time": (now + timedelta(days=5, hours=4)).isoformat(),
            "capacity": 500,
            "status": "PUBLISHED"
        }
        response = self.client.post("/api/events/", payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "Grand Music Festival"
        assert response.data["producer_name"] == "producer1"

    def test_attendee_cannot_create_event(self):
        self.client.force_authenticate(user=self.attendee)
        now = timezone.now()
        payload = {
            "title": "Unauthorized Event",
            "category": "CONCERT",
            "venue": "Metro Arena",
            "address": "123 Concert Way",
            "start_time": (now + timedelta(days=5)).isoformat(),
            "end_time": (now + timedelta(days=5, hours=4)).isoformat(),
            "capacity": 100,
            "status": "PUBLISHED"
        }
        response = self.client.post("/api/events/", payload, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_attendee_only_sees_published_events(self):
        now = timezone.now()
        # Create published event
        Event.objects.create(
            producer=self.producer,
            title="Public Gala",
            category="OTHER",
            venue="Hall A",
            address="100 Main St",
            start_time=now + timedelta(days=2),
            end_time=now + timedelta(days=2, hours=2),
            capacity=200,
            status="PUBLISHED"
        )
        # Create draft event
        Event.objects.create(
            producer=self.producer,
            title="Secret Draft",
            category="OTHER",
            venue="Hall B",
            address="100 Main St",
            start_time=now + timedelta(days=3),
            end_time=now + timedelta(days=3, hours=2),
            capacity=50,
            status="DRAFT"
        )

        # Unauthenticated / Attendee view
        self.client.force_authenticate(user=self.attendee)
        response = self.client.get("/api/events/")
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get("results") if isinstance(response.data, dict) else response.data
        titles = [e["title"] for e in results]
        assert "Public Gala" in titles
        assert "Secret Draft" not in titles

    def test_invalid_event_dates(self):
        self.client.force_authenticate(user=self.producer)
        now = timezone.now()
        payload = {
            "title": "Invalid Timing Event",
            "category": "CONCERT",
            "venue": "Metro Arena",
            "address": "123 Concert Way",
            "start_time": (now + timedelta(days=5)).isoformat(),
            "end_time": (now + timedelta(days=4)).isoformat(),  # end before start!
            "capacity": 100,
            "status": "PUBLISHED"
        }
        response = self.client.post("/api/events/", payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
