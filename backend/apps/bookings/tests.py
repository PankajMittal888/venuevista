import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from apps.events.models import Event
from apps.tickets.models import TicketType
from apps.seating.models import SeatingSection, Seat
from apps.bookings.models import Booking

User = get_user_model()


@pytest.mark.django_db
class TestBookingManagement:
    def setup_method(self):
        self.client = APIClient()
        self.producer = User.objects.create_user(
            username="bookproducer",
            email="bookproducer@example.com",
            password="Password123!",
            role="PRODUCER"
        )
        self.attendee = User.objects.create_user(
            username="bookattendee",
            email="bookattendee@example.com",
            password="Password123!",
            role="ATTENDEE"
        )
        now = timezone.now()
        self.event = Event.objects.create(
            producer=self.producer,
            title="Rock Arena 2026",
            category="CONCERT",
            venue="Grand Dome",
            address="500 Rock Ave",
            start_time=now + timedelta(days=5),
            end_time=now + timedelta(days=5, hours=3),
            capacity=100,
            status="PUBLISHED"
        )
        self.ticket_type = TicketType.objects.create(
            event=self.event,
            name="Standing General",
            tier="GENERAL",
            price="75.00",
            total_quantity=10,
            sold_quantity=0
        )
        self.section = SeatingSection.objects.create(event=self.event, name="Lower")
        self.seat1 = Seat.objects.create(section=self.section, row="A", seat_number="1")
        self.seat2 = Seat.objects.create(section=self.section, row="A", seat_number="2")

    def test_successful_booking_with_seats_and_inventory_decrement(self):
        self.client.force_authenticate(user=self.attendee)
        payload = {
            "event": self.event.id,
            "ticket_type": self.ticket_type.id,
            "quantity": 2,
            "seat_ids": [self.seat1.id, self.seat2.id]
        }
        res = self.client.post("/api/bookings/", payload, format="json")
        assert res.status_code == status.HTTP_201_CREATED
        assert res.data["total_amount"] == "150.00"
        assert res.data["booking_reference"].startswith("VV-")

        # Inventory check
        self.ticket_type.refresh_from_db()
        assert self.ticket_type.sold_quantity == 2
        assert self.ticket_type.available_quantity == 8

        # Seat status check
        self.seat1.refresh_from_db()
        self.seat2.refresh_from_db()
        assert self.seat1.status == Seat.Status.BOOKED
        assert self.seat2.status == Seat.Status.BOOKED

    def test_prevent_overselling_beyond_stock(self):
        self.client.force_authenticate(user=self.attendee)
        payload = {
            "event": self.event.id,
            "ticket_type": self.ticket_type.id,
            "quantity": 15,  # only 10 available
            "seat_ids": []
        }
        res = self.client.post("/api/bookings/", payload, format="json")
        assert res.status_code == status.HTTP_400_BAD_REQUEST

    def test_prevent_double_booking_same_seat(self):
        # Seat 1 is already booked
        self.seat1.status = Seat.Status.BOOKED
        self.seat1.save()

        self.client.force_authenticate(user=self.attendee)
        payload = {
            "event": self.event.id,
            "ticket_type": self.ticket_type.id,
            "quantity": 1,
            "seat_ids": [self.seat1.id]
        }
        res = self.client.post("/api/bookings/", payload, format="json")
        assert res.status_code == status.HTTP_400_BAD_REQUEST
