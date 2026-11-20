from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SeatingSectionViewSet, SeatViewSet

router = DefaultRouter()
router.register(r'sections', SeatingSectionViewSet, basename='seating-section')
router.register(r'seats', SeatViewSet, basename='seat')

urlpatterns = [
    path('', include(router.urls)),
]
