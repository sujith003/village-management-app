from rest_framework import viewsets
from .models import ImportantContact
from .serializers import ImportantContactSerializer


class ImportantContactViewSet(viewsets.ModelViewSet):
    queryset = ImportantContact.objects.all().order_by('category')
    serializer_class = ImportantContactSerializer