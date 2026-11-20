from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone


class Event(models.Model):
    class Category(models.TextChoices):
        CONCERT = "CONCERT", "Concert"
        CONFERENCE = "CONFERENCE", "Conference"
        THEATER = "THEATER", "Theater"
        SPORTS = "SPORTS", "Sports"
        WORKSHOP = "WORKSHOP", "Workshop"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"

    producer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="events"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=50,
        choices=Category.choices,
        default=Category.CONCERT
    )
    image_url = models.URLField(max_length=500, blank=True, null=True)
    venue = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    capacity = models.PositiveIntegerField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_time"]

    def clean(self):
        super().clean()
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValidationError({"end_time": "End time must be after start time."})
        if self.capacity is not None and self.capacity <= 0:
            raise ValidationError({"capacity": "Capacity must be greater than zero."})

    def __str__(self):
        return f"{self.title} ({self.status})"
