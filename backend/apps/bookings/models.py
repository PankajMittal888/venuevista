import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.events.models import Event
from apps.tickets.models import TicketType
from apps.seating.models import Seat


def generate_booking_reference():
    return f"VV-{uuid.uuid4().hex[:8].upper()}"


class Booking(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = "CONFIRMED", "Confirmed (Demo Paid)"
        PENDING = "PENDING", "Pending"
        CANCELLED = "CANCELLED", "Cancelled"

    booking_reference = models.CharField(
        max_length=50,
        unique=True,
        default=generate_booking_reference,
        editable=False
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    ticket_type = models.ForeignKey(
        TicketType,
        on_delete=models.PROTECT,
        related_name="bookings"
    )
    quantity = models.PositiveIntegerField(default=1)
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00")
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CONFIRMED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.booking_reference} - {self.user.username} ({self.status})"


class BookingSeat(models.Model):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="booking_seats"
    )
    seat = models.ForeignKey(
        Seat,
        on_delete=models.PROTECT,
        related_name="booking_allocations"
    )

    class Meta:
        unique_together = ("booking", "seat")

    def __str__(self):
        return f"{self.booking.booking_reference} -> {self.seat}"
