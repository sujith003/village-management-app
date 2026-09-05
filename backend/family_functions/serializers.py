from rest_framework import serializers

from .models import FamilyFunction


class FamilyFunctionSerializer(serializers.ModelSerializer):

    class Meta:
        model = FamilyFunction
        fields = "__all__"
        read_only_fields = ["status", "is_active", "created_at"]