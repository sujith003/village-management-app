from rest_framework import serializers

from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):

    festival_name = serializers.CharField(
        source="festival.festival_name",
        read_only=True,
    )

    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True,
    )

    balance_amount = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = [
            "id",
            "festival",
            "festival_name",
            "expense_title",
            "category",
            "category_display",
            "amount",
            "advance_amount",
            "balance_amount",
            "expense_date",
            "description",
            "created_at",
        ]

    def get_balance_amount(self, obj):
        return obj.amount - obj.advance_amount