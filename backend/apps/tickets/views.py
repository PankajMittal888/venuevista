from rest_framework import viewsets, filters, permissions
from .models import TicketType
from .serializers import TicketTypeSerializer
from .permissions import IsTicketManagerOrReadOnly
from apps.events.models import Event


class TicketTypeViewSet(viewsets.ModelViewSet):
    serializer_class = TicketTypeSerializer
    permission_classes = [IsTicketManagerOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["price", "total_quantity", "name"]
    ordering = ["price"]

    def get_queryset(self):
        queryset = TicketType.objects.select_related("event")
        user = self.request.user

        # Public / attendee can only see ticket types for published events
        if not user.is_authenticated or user.role == "ATTENDEE":
            queryset = queryset.filter(event__status=Event.Status.PUBLISHED)

        event_id = self.request.query_params.get("event")
        if event_id:
            queryset = queryset.filter(event_id=event_id)

        tier = self.request.query_params.get("tier")
        if tier:
            queryset = queryset.filter(tier__iexact=tier)

        return queryset

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]
        user = self.request.user
        if user.role == "PRODUCER" and event.producer != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only create tickets for your own events.")
        serializer.save()
