from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SeatingSection, Seat
from .serializers import SeatingSectionSerializer, SeatSerializer
from .permissions import IsSeatingManagerOrReadOnly


class SeatingSectionViewSet(viewsets.ModelViewSet):
    serializer_class = SeatingSectionSerializer
    permission_classes = [IsSeatingManagerOrReadOnly]

    def get_queryset(self):
        queryset = SeatingSection.objects.prefetch_related("seats")
        event_id = self.request.query_params.get("event")
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        return queryset

    @action(detail=True, methods=["post"], url_path="generate-seats")
    def generate_seats(self, request, pk=None):
        section = self.get_object()
        rows = request.data.get("rows", [])  # e.g. ["A", "B", "C"]
        seats_per_row = int(request.data.get("seats_per_row", 10))

        if not rows or seats_per_row <= 0:
            return Response(
                {"error": "Please provide valid 'rows' (list) and positive 'seats_per_row'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_seats = []
        for r in rows:
            for s_idx in range(1, seats_per_row + 1):
                seat_num = str(s_idx)
                seat, _ = Seat.objects.get_or_create(
                    section=section,
                    row=r,
                    seat_number=seat_num,
                    defaults={"status": Seat.Status.AVAILABLE}
                )
                created_seats.append(seat)

        return Response({
            "message": f"Successfully ensured {len(created_seats)} seats for section {section.name}.",
            "section": SeatingSectionSerializer(section).data
        }, status=status.HTTP_201_CREATED)


class SeatViewSet(viewsets.ModelViewSet):
    serializer_class = SeatSerializer
    permission_classes = [IsSeatingManagerOrReadOnly]

    def get_queryset(self):
        queryset = Seat.objects.select_related("section", "section__event")
        section_id = self.request.query_params.get("section")
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        event_id = self.request.query_params.get("event")
        if event_id:
            queryset = queryset.filter(section__event_id=event_id)
        seat_status = self.request.query_params.get("status")
        if seat_status:
            queryset = queryset.filter(status__iexact=seat_status)
        return queryset
