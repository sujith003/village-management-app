from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AdminDetailViewSet


router = DefaultRouter()

router.register(
    "admin-details",
    AdminDetailViewSet,
    basename="admin-details"
)

urlpatterns = [
    path("", include(router.urls)),
]
