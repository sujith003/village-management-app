from django.db.models import Sum

from rest_framework import viewsets
from rest_framework.response import Response

from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):

    queryset = Expense.objects.all().order_by(
        "-expense_date",
        "-id"
    )

    serializer_class = ExpenseSerializer

    def list(self, request, *args, **kwargs):

        queryset = self.get_queryset()

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        total_amount = queryset.aggregate(
            total=Sum("amount")
        )["total"] or 0

        advance_amount = queryset.filter(
            category="ADVANCE"
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        return Response({
            "expenses": serializer.data,
            "total_amount": str(total_amount),
            "advance_amount": str(advance_amount),
        })