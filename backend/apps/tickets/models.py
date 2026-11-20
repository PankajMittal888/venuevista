from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal
from apps.events.models import Event


class TicketType(models.Model):
    class Tier(models.TextChoices):
        GENERAL = "GENERAL", "General Admission"
        VIP = "VIP", "VIP"
        PREMIUM = "PREMIUM", "Premium"

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="ticket_types"
    )
    name = models.CharField(max_length=100)
    tier = models.CharField(
        max_length=20,
        choices=Tier.choices,
        default=Tier.GENERAL
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    total_quantity = models.PositiveIntegerField()
    sold_quantity = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["price", "id"]
        unique_together = ("event", "name")

    @property
    def available_quantity(self):
        return max(0, self.total_quantity - self.sold_quantity)

    @property
    def is_available(self):
        return self.available_quantity > 0 and self.event.status == Event.Status.PUBLISHED

    def clean(self):
        super().clean()
        if self.price is not None and self.price < Decimal("0.00"):
            raise ValidationError({"price": "Price cannot be negative."})
        if self.total_quantity is not None and self.sold_quantity is not None:
            if self.sold_quantity > self.total_quantity:
                raise ValidationError({"sold_quantity": "Sold quantity cannot exceed total quantity."})

    def __str__(self):
        return f"{self.event.title} - {self.name} (${self.price})"
