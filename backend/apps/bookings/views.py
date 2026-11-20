from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Booking, BookingSeat
from .serializers import BookingSerializer
from .permissions import IsBookingOwnerOrStaff
from apps.seating.models import Seat


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsBookingOwnerOrStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "total_amount"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        queryset = Booking.objects.select_related("user", "event", "ticket_type").prefetch_related("booking_seats__seat__section")

        if user.role == "ATTENDEE":
            queryset = queryset.filter(user=user)
        elif user.role == "PRODUCER":
            # Producers can view bookings made for their events OR bookings they personally made
            queryset = queryset.filter(event__producer=user)
        # ADMIN and CONTENT_MANAGER can see all bookings

        event_id = self.request.query_params.get("event")
        if event_id:
            queryset = queryset.filter(event_id=event_id)

        booking_status = self.request.query_params.get("status")
        if booking_status:
            queryset = queryset.filter(status__iexact=booking_status)

        return queryset

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel_booking(self, request, pk=None):
        booking = self.get_object()
        if booking.status == Booking.Status.CANCELLED:
            return Response({"error": "Booking is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Release tickets
            ticket_type = booking.ticket_type
            ticket_type.sold_quantity = max(0, ticket_type.sold_quantity - booking.quantity)
            ticket_type.save()

            # Release seats
            for bs in booking.booking_seats.all():
                s = bs.seat
                s.status = Seat.Status.AVAILABLE
                s.save()

            booking.status = Booking.Status.CANCELLED
            booking.save()

        return Response({"message": "Booking successfully cancelled and inventory released."})
