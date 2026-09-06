from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer

from families.models import Family
from festivals.models import Festival
from payments.models import Payment

from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated


class NotificationListView(generics.ListAPIView):

    queryset = Notification.objects.all().order_by("-created_at")
    serializer_class = NotificationSerializer

class NotificationClearAllView(APIView):
    """
    Deletes every Notification record. Only the notification log is
    touched here — Family Function requests/approvals, uploaded images,
    and every other model are untouched by this endpoint.

    Only the Django admin account (the one that logs in via
    /api/login/ and receives a DRF auth token) can call this — public
    users authenticate through a separate OTP flow and never hold a
    token, so IsAuthenticated here is an effective, real admin check,
    not just a hidden button.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        Notification.objects.all().delete()
        return Response(status=204)

class NotificationMarkAllUnreadView(APIView):
    """
    Marks every Notification record as unread. Same admin-only
    protection as NotificationClearAllView above, for the same reason.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request):
        Notification.objects.all().update(is_read=False)
        return Response(status=200)


class NotificationReadView(APIView):

    def patch(self, request, pk):

        try:
            notification = Notification.objects.get(pk=pk)
        except Notification.DoesNotExist:
            return Response(
                {"detail": "Notification not found"},
                status=404
            )

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response(
            NotificationSerializer(notification).data
        )


class PaymentReminderDetailsView(APIView):

    def get(self, request):

        festival = Festival.objects.filter(
            contribution_amount__gt=0
        ).order_by("-festival_date").first()

        if not festival:
            return Response([])

        details = []

        for family in Family.objects.all():

            paid = Payment.objects.filter(
                family=family,
                festival=festival
            ).aggregate(
                total=Sum("amount")
            )["total"] or 0

            pending = festival.contribution_amount - paid

            if pending > 0:

                details.append({
                    "family_id": family.id,
                    "family_name": family.family_name,
                    "festival_id": festival.id,
                    "festival_name": festival.festival_name,
                    "year": festival.year,
                    "contribution": str(
                        festival.contribution_amount
                    ),
                    "paid": str(paid),
                    "pending": str(pending),
                })

        return Response(details)