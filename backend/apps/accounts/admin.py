# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# from .models import User


# @admin.register(User)
# class UserAdmin(BaseUserAdmin):
#     list_display = ('email', 'username', 'name', 'role', 'is_staff', 'is_active', 'created_at')
#     list_filter = ('role', 'is_staff', 'is_active')
#     search_fields = ('email', 'username', 'name')
#     ordering = ('email',)
#     fieldsets = (
#         (None, {'fields': ('email', 'password')}),
#         ('Personal Info', {'fields': ('name', 'username')}),
#         ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
#         ('Important Dates', {'fields': ('last_login', 'created_at')}),
#     )
#     readonly_fields = ('created_at', 'last_login')
#     add_fieldsets = (
#         (None, {
#             'classes': ('wide',),
#             'fields': ('email', 'username', 'name', 'role', 'password'),
#         }),
#     )


from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "role",
        "phone",
        "is_active",
        "created_at",
    )

    list_filter = (
        "role",
        "is_active",
        "is_staff",
    )

    search_fields = (
        "username",
        "email",
        "phone",
    )

    fieldsets = UserAdmin.fieldsets + (
        (
            "VenueVista Information",
            {
                "fields": (
                    "role",
                    "phone",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "VenueVista Information",
            {
                "fields": (
                    "role",
                    "phone",
                )
            },
        ),
    )