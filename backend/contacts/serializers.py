from rest_framework import serializers
from .models import ImportantContact


class ImportantContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportantContact
        fields = '__all__'