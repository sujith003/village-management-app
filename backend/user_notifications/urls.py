from django.urls import path

from .views import (
    NotificationListView,
    NotificationReadView,
    PaymentReminderDetailsView,
)

urlpatterns = [

    path(
        "",
        NotificationListView.as_view(),
        name="notification-list"
    ),

    path(
        "<int:pk>/read/",
        NotificationReadView.as_view(),
        name="notification-read"
    ),

    path(
        "payment-reminders/",
        PaymentReminderDetailsView.as_view(),
        name="payment-reminder-details"
    ),
]