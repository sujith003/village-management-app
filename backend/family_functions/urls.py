from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import FamilyFunctionViewSet


router = DefaultRouter()

router.register(
    "family-functions",
    FamilyFunctionViewSet,
    basename="family-functions",
)

urlpatterns = [
    path("", include(router.urls)),
]