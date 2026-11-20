from rest_framework import serializers
from .models import TicketType
from apps.events.models import Event


class TicketTypeSerializer(serializers.ModelSerializer):
    available_quantity = serializers.IntegerField(read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    event_title = serializers.ReadOnlyField(source="event.title")

    class Meta:
        model = TicketType
        fields = [
            "id",
            "event",
            "event_title",
            "name",
            "tier",
            "price",
            "total_quantity",
            "sold_quantity",
            "available_quantity",
            "is_available",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "sold_quantity", "available_quantity", "is_available", "created_at", "updated_at"]

    def validate(self, attrs):
        event = attrs.get("event") or (self.instance.event if self.instance else None)
        total_quantity = attrs.get("total_quantity") or (self.instance.total_quantity if self.instance else None)
        price = attrs.get("price") or (self.instance.price if self.instance else None)

        if price is not None and price < 0:
            raise serializers.ValidationError({"price": "Price cannot be negative."})

        if total_quantity is not None and total_quantity <= 0:
            raise serializers.ValidationError({"total_quantity": "Total quantity must be greater than zero."})

        # Ensure total tickets across all ticket types do not exceed event capacity
        if event and total_quantity is not None:
            existing_tickets = TicketType.objects.filter(event=event)
            if self.instance:
                existing_tickets = existing_tickets.exclude(pk=self.instance.pk)
            total_allocated = sum(t.total_quantity for t in existing_tickets) + total_quantity
            if total_allocated > event.capacity:
                raise serializers.ValidationError({
                    "total_quantity": f"Total tickets ({total_allocated}) would exceed event capacity ({event.capacity})."
                })

        return attrs
