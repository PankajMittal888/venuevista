from rest_framework import permissions


class IsSeatingManagerOrReadOnly(permissions.BasePermission):
    """
    Public and Attendees can view seating layout and available seats.
    Producers can configure seating for their own events.
    Content Managers and Admins can configure seating for all events.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user and request.user.is_authenticated and (
                request.user.role in ["PRODUCER", "CONTENT_MANAGER", "ADMIN"] or request.user.is_superuser
            )
        )

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == "ADMIN" or request.user.is_superuser:
            return True
        event = obj.event if hasattr(obj, "event") else obj.section.event
        if request.user.role == "PRODUCER" and event.producer == request.user:
            return True
        if request.user.role == "CONTENT_MANAGER":
            return True
        return False
