from rest_framework import permissions


class IsEventProducerOrReadOnly(permissions.BasePermission):
    """
    Attendees and unauthenticated users can only read published events.
    Producers/Admins can create events.
    Only the event's producer, Content Managers, and Admins can update/delete.
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
            if obj.status == "PUBLISHED":
                return True
            return bool(
                request.user and request.user.is_authenticated and (
                    request.user.role in ["PRODUCER", "CONTENT_MANAGER", "ADMIN"] or request.user.is_superuser
                )
            )

        if not (request.user and request.user.is_authenticated):
            return False

        if request.user.role == "ADMIN" or request.user.is_superuser:
            return True
        if request.user.role == "PRODUCER" and obj.producer == request.user:
            return True
        if request.user.role == "CONTENT_MANAGER":
            return True

        return False
