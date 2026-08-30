from rest_framework import viewsets

from .models import AdminDetail
from .serializers import AdminDetailSerializer


class AdminDetailViewSet(viewsets.ModelViewSet):

    queryset = AdminDetail.objects.all()
    serializer_class = AdminDetailSerializer
