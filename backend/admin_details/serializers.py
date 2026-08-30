from rest_framework import serializers

from .models import AdminDetail


class AdminDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdminDetail
        fields = "__all__"
