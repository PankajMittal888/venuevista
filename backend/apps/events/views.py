from rest_framework import viewsets, filters, permissions
from django.db.models import Q
from django.utils import timezone
from .models import Event
from .serializers import EventSerializer
from .permissions import IsEventProducerOrReadOnly


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsEventProducerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "venue", "address", "category"]
    ordering_fields = ["start_time", "capacity", "created_at"]
    ordering = ["start_time"]

    def get_queryset(self):
        user = self.request.user
        queryset = Event.objects.all()

        # If attendee or unauthenticated, only show PUBLISHED events
        if not user.is_authenticated or user.role == "ATTENDEE":
            queryset = queryset.filter(status=Event.Status.PUBLISHED)
        elif user.role == "PRODUCER":
            # Can see published events or own drafts/events
            queryset = queryset.filter(Q(producer=user) | Q(status=Event.Status.PUBLISHED))
        # CONTENT_MANAGER and ADMIN can see all events

        # Query param filters
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__iexact=category)

        status_param = self.request.query_params.get("status")
        if status_param and user.is_authenticated and user.role != "ATTENDEE":
            queryset = queryset.filter(status__iexact=status_param)

        time_frame = self.request.query_params.get("time_frame")
        now = timezone.now()
        if time_frame == "upcoming":
            queryset = queryset.filter(start_time__gte=now)
        elif time_frame == "past":
            queryset = queryset.filter(end_time__lt=now)

        return queryset
