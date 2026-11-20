import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from apps.events.models import Event
from apps.tickets.models import TicketType
from apps.bookings.models import Booking

User = get_user_model()


@pytest.mark.django_db
class TestAnalyticsDashboard:
    def setup_method(self):
        self.client = APIClient()
        self.producer = User.objects.create_user(
            username="analyticsproducer",
            email="analyticsproducer@example.com",
            password="Password123!",
            role="PRODUCER"
        )
        self.attendee = User.objects.create_user(
            username="analyticsattendee",
            email="analyticsattendee@example.com",
            password="Password123!",
            role="ATTENDEE"
        )
        now = timezone.now()
        self.event = Event.objects.create(
            producer=self.producer,
            title="Tech Summit 2026",
            category="CONFERENCE",
            venue="Tech Center",
            address="101 Innovation Dr",
            start_time=now + timedelta(days=3),
            end_time=now + timedelta(days=3, hours=8),
            capacity=200,
            status="PUBLISHED"
        )
        self.ticket = TicketType.objects.create(
            event=self.event,
            name="General Pass",
            tier="GENERAL",
            price="100.00",
            total_quantity=50,
            sold_quantity=2
        )
        Booking.objects.create(
            user=self.attendee,
            event=self.event,
            ticket_type=self.ticket,
            quantity=2,
            total_amount=200.00,
            status=Booking.Status.CONFIRMED
        )

    def test_producer_views_analytics(self):
        self.client.force_authenticate(user=self.producer)
        res = self.client.get("/api/analytics/dashboard/")
        assert res.status_code == status.HTTP_200_OK
        metrics = res.data["metrics"]
        assert metrics["total_events"] == 1
        assert metrics["total_bookings"] == 1
        assert metrics["total_tickets_sold"] == 2
        assert metrics["total_revenue"] == 200.0
        assert metrics["available_tickets"] == 48

    def test_attendee_cannot_view_analytics(self):
        self.client.force_authenticate(user=self.attendee)
        res = self.client.get("/api/analytics/dashboard/")
        assert res.status_code == status.HTTP_403_FORBIDDEN
