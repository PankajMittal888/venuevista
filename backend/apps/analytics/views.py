from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from apps.events.models import Event
from apps.tickets.models import TicketType
from apps.bookings.models import Booking


class AnalyticsDashboardAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role not in ["ADMIN", "PRODUCER", "CONTENT_MANAGER"] and not user.is_superuser:
            return Response(
                {"error": "Access denied. Only producers and staff can view analytics."},
                status=status.HTTP_403_FORBIDDEN
            )

        events_qs = Event.objects.all()
        bookings_qs = Booking.objects.filter(status=Booking.Status.CONFIRMED)
        tickets_qs = TicketType.objects.all()

        # Scoping: If PRODUCER, restrict to owned events
        if user.role == "PRODUCER":
            events_qs = events_qs.filter(producer=user)
            bookings_qs = bookings_qs.filter(event__producer=user)
            tickets_qs = tickets_qs.filter(event__producer=user)

        total_events = events_qs.count()
        total_bookings = bookings_qs.count()

        agg_bookings = bookings_qs.aggregate(
            total_tickets_sold=Sum("quantity"),
            total_revenue=Sum("total_amount")
        )
        total_tickets_sold = agg_bookings["total_tickets_sold"] or 0
        total_revenue = agg_bookings["total_revenue"] or 0.0

        agg_tickets = tickets_qs.aggregate(
            total_capacity=Sum("total_quantity"),
            total_sold=Sum("sold_quantity")
        )
        total_capacity = agg_tickets["total_capacity"] or 0
        total_sold = agg_tickets["total_sold"] or 0
        available_tickets = max(0, total_capacity - total_sold)

        # Sales by event
        sales_by_event = list(
            bookings_qs.values("event_id", "event__title")
            .annotate(
                tickets_sold=Sum("quantity"),
                revenue=Sum("total_amount"),
                bookings_count=Count("id")
            )
            .order_by("-revenue")[:10]
        )

        # Sales by ticket category / tier
        sales_by_tier = list(
            bookings_qs.values(tier=F("ticket_type__tier"))
            .annotate(
                tickets_sold=Sum("quantity"),
                revenue=Sum("total_amount")
            )
            .order_by("-revenue")
        )

        # Revenue over time (by date)
        revenue_over_time = list(
            bookings_qs.annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(
                revenue=Sum("total_amount"),
                bookings_count=Count("id")
            )
            .order_by("date")[:30]
        )

        return Response({
            "metrics": {
                "total_events": total_events,
                "total_bookings": total_bookings,
                "total_tickets_sold": total_tickets_sold,
                "total_revenue": float(total_revenue),
                "available_tickets": available_tickets,
            },
            "sales_by_event": sales_by_event,
            "sales_by_tier": sales_by_tier,
            "revenue_over_time": revenue_over_time,
        })
