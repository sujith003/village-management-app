from rest_framework import viewsets
from .models import Family
from .serializers import FamilySerializer


class FamilyViewSet(viewsets.ModelViewSet):
    queryset = Family.objects.all().order_by('-id')
    serializer_class = FamilySerializer