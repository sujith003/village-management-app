from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ImportantPersonViewSet


router = DefaultRouter()

router.register(
    "important-persons",
    ImportantPersonViewSet,
    basename="important-persons"
)

urlpatterns = [
    path("", include(router.urls)),
]
