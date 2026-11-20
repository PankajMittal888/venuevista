from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/', include('apps.accounts.urls')),
    path('api/events/', include('apps.events.urls')),
    path('api/tickets/', include('apps.tickets.urls')),
    path('api/seating/', include('apps.seating.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]