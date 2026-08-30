from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FestivalPhotoViewSet


router = DefaultRouter()

router.register(
    'gallery',
    FestivalPhotoViewSet,
    basename='gallery'
)

urlpatterns = [
    path('', include(router.urls)),
]