from rest_framework import permissions


class IsAdminUserRole(permissions.BasePermission):
    """Allows access only to users with the ADMIN role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_superuser))


class IsProducerUserRole(permissions.BasePermission):
    """Allows access to PRODUCER and ADMIN roles."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                request.user.role in ['PRODUCER', 'ADMIN'] or request.user.is_superuser
            )
        )


class IsContentManagerUserRole(permissions.BasePermission):
    """Allows access to CONTENT_MANAGER, PRODUCER, and ADMIN roles."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                request.user.role in ['CONTENT_MANAGER', 'PRODUCER', 'ADMIN'] or request.user.is_superuser
            )
        )


class IsAttendeeUserRole(permissions.BasePermission):
    """Allows access to ATTENDEE and above roles."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
