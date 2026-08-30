from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    family_name = serializers.CharField(
        source='family.family_name',
        read_only=True
    )

    festival_name = serializers.CharField(
        source='festival.festival_name',
        read_only=True
    )

    class Meta:
        model = Payment
        fields = '__all__'