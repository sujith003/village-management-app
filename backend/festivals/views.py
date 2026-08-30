from rest_framework import viewsets

from .models import Festival
from .serializers import FestivalSerializer

from user_notifications.models import Notification


class FestivalViewSet(viewsets.ModelViewSet):
    queryset = Festival.objects.all().order_by("-festival_date")
    serializer_class = FestivalSerializer

    def perform_create(self, serializer):
        festival = serializer.save()

        if festival.contribution_amount > 0:
            Notification.objects.create(
                title="Payment Reminder",
                message=(
                    f"Contribution of ₹{festival.contribution_amount} "
                    f"is pending for {festival.festival_name} "
                    f"{festival.year}. Click to view payment details."
                ),
                notification_type="PAYMENT",
            )