from django.urls import path

from .views import (
    NotificationListView,
    NotificationReadView,
    NotificationClearAllView,
    NotificationMarkAllUnreadView,
    PaymentReminderDetailsView,
)


urlpatterns = [

    path(
        "clear-all/",
        NotificationClearAllView.as_view(),
        name="notification-clear-all"
    ),

    path(
        "mark-all-unread/",
        NotificationMarkAllUnreadView.as_view(),
        name="notification-mark-all-unread"
    ),

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