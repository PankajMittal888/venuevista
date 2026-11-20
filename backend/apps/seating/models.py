from django.db import models
from apps.events.models import Event


class SeatingSection(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="seating_sections"
    )
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("event", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.event.title} - Section {self.name}"


class Seat(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        RESERVED = "RESERVED", "Reserved"
        BOOKED = "BOOKED", "Booked"

    section = models.ForeignKey(
        SeatingSection,
        on_delete=models.CASCADE,
        related_name="seats"
    )
    row = models.CharField(max_length=10)
    seat_number = models.CharField(max_length=10)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("section", "row", "seat_number")
        ordering = ["row", "seat_number"]

    def __str__(self):
        return f"{self.section.name} Row {self.row} Seat {self.seat_number} ({self.status})"
