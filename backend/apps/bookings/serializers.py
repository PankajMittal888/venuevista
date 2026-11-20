from rest_framework import serializers
from django.db import transaction
from decimal import Decimal
from .models import Booking, BookingSeat
from apps.events.models import Event
from apps.tickets.models import TicketType
from apps.seating.models import Seat


class BookingSeatSerializer(serializers.ModelSerializer):
    row = serializers.ReadOnlyField(source="seat.row")
    seat_number = serializers.ReadOnlyField(source="seat.seat_number")
    section_name = serializers.ReadOnlyField(source="seat.section.name")

    class Meta:
        model = BookingSeat
        fields = ["id", "seat", "row", "seat_number", "section_name"]


class BookingSerializer(serializers.ModelSerializer):
    booking_seats = BookingSeatSerializer(many=True, read_only=True)
    event_title = serializers.ReadOnlyField(source="event.title")
    ticket_type_name = serializers.ReadOnlyField(source="ticket_type.name")
    user_email = serializers.ReadOnlyField(source="user.email")
    seat_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        default=list
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "booking_reference",
            "user",
            "user_email",
            "event",
            "event_title",
            "ticket_type",
            "ticket_type_name",
            "quantity",
            "total_amount",
            "status",
            "seat_ids",
            "booking_seats",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "booking_reference",
            "user",
            "total_amount",
            "status",
            "booking_seats",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        ticket_type = attrs.get("ticket_type")
        event = attrs.get("event")
        quantity = attrs.get("quantity", 1)
        seat_ids = attrs.get("seat_ids", [])

        if quantity <= 0:
            raise serializers.ValidationError({"quantity": "Quantity must be at least 1."})

        if ticket_type.event != event:
            raise serializers.ValidationError({"ticket_type": "This ticket type does not belong to the selected event."})

        if event.status != Event.Status.PUBLISHED:
            raise serializers.ValidationError({"event": "Bookings are only allowed for published events."})

        if seat_ids and len(seat_ids) != quantity:
            raise serializers.ValidationError({
                "seat_ids": f"Number of selected seats ({len(seat_ids)}) must match ticket quantity ({quantity})."
            })

        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        seat_ids = validated_data.pop("seat_ids", [])
        ticket_type_obj = validated_data["ticket_type"]
        quantity = validated_data["quantity"]

        # Run transaction with row-level locks
        with transaction.atomic():
            ticket_type = TicketType.objects.select_for_update().get(pk=ticket_type_obj.pk)

            if ticket_type.available_quantity < quantity:
                raise serializers.ValidationError(
                    {"error": f"Only {ticket_type.available_quantity} tickets left in stock."}
                )

            # Deduct inventory
            ticket_type.sold_quantity += quantity
            ticket_type.save()

            total_amount = ticket_type.price * Decimal(quantity)
            booking = Booking.objects.create(
                user=user,
                total_amount=total_amount,
                **validated_data
            )

            if seat_ids:
                # Lock selected seats
                seats = Seat.objects.select_for_update().filter(
                    id__in=seat_ids,
                    section__event=validated_data["event"]
                )
                if seats.count() != len(seat_ids):
                    raise serializers.ValidationError({"seat_ids": "Some selected seats do not exist for this event."})

                for s in seats:
                    if s.status != Seat.Status.AVAILABLE:
                        raise serializers.ValidationError({"seat_ids": f"Seat {s.row}-{s.seat_number} is no longer available."})
                    s.status = Seat.Status.BOOKED
                    s.save()
                    BookingSeat.objects.create(booking=booking, seat=s)

        return booking
