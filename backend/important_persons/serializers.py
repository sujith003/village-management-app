from rest_framework import serializers

from .models import ImportantPerson


class ImportantPersonSerializer(serializers.ModelSerializer):

    class Meta:
        model = ImportantPerson
        fields = "__all__"
