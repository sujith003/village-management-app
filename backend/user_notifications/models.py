from django.db import models


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("FESTIVAL", "Festival"),
        ("GALLERY", "Gallery"),
        ("ANNOUNCEMENT", "Announcement"),
        ("PAYMENT", "Payment Reminder"),
    ]

    title = models.CharField(max_length=200)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title