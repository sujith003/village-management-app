from rest_framework import viewsets

from .models import ImportantPerson
from .serializers import ImportantPersonSerializer


class ImportantPersonViewSet(viewsets.ModelViewSet):

    queryset = ImportantPerson.objects.all()
    serializer_class = ImportantPersonSerializer
