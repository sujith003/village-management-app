from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FestivalViewSet


router = DefaultRouter()
router.register('festivals', FestivalViewSet, basename='festival')

urlpatterns = [
    path('', include(router.urls)),
]