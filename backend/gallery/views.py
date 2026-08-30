from rest_framework import viewsets

from .models import FestivalPhoto
from .serializers import FestivalPhotoSerializer


class FestivalPhotoViewSet(viewsets.ModelViewSet):

    queryset = FestivalPhoto.objects.all().order_by("-uploaded_at")
    serializer_class = FestivalPhotoSerializer