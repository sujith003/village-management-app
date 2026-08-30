from rest_framework import viewsets

from .models import Payment
from .serializers import PaymentSerializer
from user_notifications.models import Notification

from django.db.models import Sum


class PaymentViewSet(viewsets.ModelViewSet):

    queryset = Payment.objects.all().order_by('-payment_date')
    serializer_class = PaymentSerializer

    def perform_create(self, serializer):

        payment = serializer.save()

        family = payment.family
        festival = payment.festival

        paid = Payment.objects.filter(
            family=family,
            festival=festival
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        pending = festival.contribution_amount - paid

        if pending > 0:
            Notification.objects.create(
                title="Payment Reminder",
                message=(
                    f"{family.family_name}, your pending contribution "
                    f"for {festival.festival_name} {festival.year} "
                    f"is ₹{pending}."
                ),
                notification_type="PAYMENT"
            )