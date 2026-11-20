from rest_framework import serializers
from .models import SeatingSection, Seat


class SeatSerializer(serializers.ModelSerializer):
    section_name = serializers.ReadOnlyField(source="section.name")
    event_id = serializers.ReadOnlyField(source="section.event.id")

    class Meta:
        model = Seat
        fields = [
            "id",
            "section",
            "section_name",
            "event_id",
            "row",
            "seat_number",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SeatingSectionSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)
    total_seats = serializers.SerializerMethodField()
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = SeatingSection
        fields = [
            "id",
            "event",
            "name",
            "description",
            "total_seats",
            "available_seats",
            "seats",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_total_seats(self, obj):
        return obj.seats.count()

    def get_available_seats(self, obj):
        return obj.seats.filter(status=Seat.Status.AVAILABLE).count()
