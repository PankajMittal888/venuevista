import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from apps.events.models import Event
from apps.tickets.models import TicketType

User = get_user_model()


@pytest.mark.django_db
class TestTicketManagement:
    def setup_method(self):
        self.client = APIClient()
        self.producer = User.objects.create_user(
            username="ticketproducer",
            email="ticketproducer@example.com",
            password="Password123!",
            role="PRODUCER"
        )
        self.other_producer = User.objects.create_user(
            username="otherproducer",
            email="otherproducer@example.com",
            password="Password123!",
            role="PRODUCER"
        )
        self.attendee = User.objects.create_user(
            username="ticketattendee",
            email="ticketattendee@example.com",
            password="Password123!",
            role="ATTENDEE"
        )
        now = timezone.now()
        self.event = Event.objects.create(
            producer=self.producer,
            title="Symphony Night",
            category="CONCERT",
            venue="Concert Hall",
            address="123 Harmony St",
            start_time=now + timedelta(days=10),
            end_time=now + timedelta(days=10, hours=3),
            capacity=100,
            status="PUBLISHED"
        )

    def test_producer_create_ticket_type(self):
        self.client.force_authenticate(user=self.producer)
        payload = {
            "event": self.event.id,
            "name": "Early Bird General",
            "tier": "GENERAL",
            "price": "45.00",
            "total_quantity": 50
        }
        response = self.client.post("/api/tickets/", payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "Early Bird General"
        assert response.data["available_quantity"] == 50

    def test_cannot_exceed_event_capacity(self):
        self.client.force_authenticate(user=self.producer)
        payload = {
            "event": self.event.id,
            "name": "Oversized Batch",
            "tier": "GENERAL",
            "price": "20.00",
            "total_quantity": 150  # capacity is only 100
        }
        response = self.client.post("/api/tickets/", payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_unauthorized_producer_cannot_add_tickets(self):
        self.client.force_authenticate(user=self.other_producer)
        payload = {
            "event": self.event.id,
            "name": "Hacked Ticket",
            "tier": "VIP",
            "price": "100.00",
            "total_quantity": 10
        }
        response = self.client.post("/api/tickets/", payload, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_attendee_can_view_tickets_for_published_event(self):
        TicketType.objects.create(
            event=self.event,
            name="Standard Admission",
            tier="GENERAL",
            price="50.00",
            total_quantity=50
        )
        self.client.force_authenticate(user=self.attendee)
        response = self.client.get(f"/api/tickets/?event={self.event.id}")
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get("results") if isinstance(response.data, dict) else response.data
        assert len(results) == 1
        assert results[0]["name"] == "Standard Admission"
