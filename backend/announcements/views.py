from rest_framework import viewsets

from .models import Announcement
from .serializers import AnnouncementSerializer


class AnnouncementViewSet(viewsets.ModelViewSet):

    queryset = Announcement.objects.all().order_by(
        "-announcement_date",
        "-created_at"
    )

    serializer_class = AnnouncementSerializer