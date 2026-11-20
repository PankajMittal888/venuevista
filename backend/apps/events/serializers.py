from rest_framework import serializers
from .models import Event
from django.utils import timezone


class EventSerializer(serializers.ModelSerializer):
    producer_name = serializers.ReadOnlyField(source="producer.username")

    class Meta:
        model = Event
        fields = [
            "id",
            "producer",
            "producer_name",
            "title",
            "description",
            "category",
            "image_url",
            "venue",
            "address",
            "start_time",
            "end_time",
            "capacity",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "producer", "created_at", "updated_at"]

    def validate(self, attrs):
        start_time = attrs.get("start_time") or (self.instance.start_time if self.instance else None)
        end_time = attrs.get("end_time") or (self.instance.end_time if self.instance else None)
        capacity = attrs.get("capacity") or (self.instance.capacity if self.instance else None)

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({"end_time": "End time must be after start time."})

        if capacity is not None and capacity <= 0:
            raise serializers.ValidationError({"capacity": "Capacity must be greater than zero."})

        return attrs

    def create(self, validated_data):
        validated_data["producer"] = self.context["request"].user
        return super().create(validated_data)
