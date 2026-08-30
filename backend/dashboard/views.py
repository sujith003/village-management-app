from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from rest_framework.views import APIView

from families.models import Family
from festivals.models import Festival
from payments.models import Payment
from expenses.models import Expense


class DashboardView(APIView):

    def get(self, request):
        total_families = Family.objects.count()
        total_festivals = Festival.objects.count()

        total_collection = (
            Payment.objects.aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        total_expenses = (
            Expense.objects.aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        balance = total_collection - total_expenses

        monthly_payments = (
            Payment.objects
            .annotate(month=TruncMonth("payment_date"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )

        monthly_expenses = (
            Expense.objects
            .annotate(month=TruncMonth("expense_date"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )

        monthly_data = {}

        for item in monthly_payments:
            month = item["month"].strftime("%Y-%m")

            monthly_data.setdefault(
                month,
                {
                    "month": month,
                    "collection": 0,
                    "expenses": 0,
                },
            )

            monthly_data[month]["collection"] = float(
                item["total"] or 0
            )

        for item in monthly_expenses:
            month = item["month"].strftime("%Y-%m")

            monthly_data.setdefault(
                month,
                {
                    "month": month,
                    "collection": 0,
                    "expenses": 0,
                },
            )

            monthly_data[month]["expenses"] = float(
                item["total"] or 0
            )

        expense_categories = (
            Expense.objects
            .values("category")
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )

        category_data = [
            {
                "category": item["category"],
                "total": float(item["total"] or 0),
            }
            for item in expense_categories
        ]

        return Response(
            {
                "total_families": total_families,
                "total_festivals": total_festivals,
                "total_collection": str(total_collection),
                "total_expenses": str(total_expenses),
                "balance": str(balance),
                "monthly_data": list(monthly_data.values()),
                "expense_categories": category_data,
            }
        )