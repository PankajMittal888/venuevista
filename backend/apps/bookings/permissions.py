from rest_framework import permissions


class IsBookingOwnerOrStaff(permissions.BasePermission):
    """
    Attendees can only view and manage their own bookings.
    Producers can view bookings for their own events.
    Content Managers and Admins can view all bookings.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == "ADMIN" or user.is_superuser:
            return True
        if obj.user == user:
            return True
        if user.role == "PRODUCER" and obj.event.producer == user:
            return True
        if user.role == "CONTENT_MANAGER":
            return True
        return False
