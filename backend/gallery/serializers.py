from rest_framework import serializers

from .models import FestivalPhoto


class FestivalPhotoSerializer(serializers.ModelSerializer):

    class Meta:
        model = FestivalPhoto
        fields = "__all__"