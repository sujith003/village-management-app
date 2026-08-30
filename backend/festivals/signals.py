from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Festival
from user_notifications.models import Notification


@receiver(post_save, sender=Festival)
def create_festival_notification(sender, instance, created, **kwargs):

    if created:
        Notification.objects.create(
            title="New Festival Added",
            message=(
                f"{instance.festival_name} festival has been added "
                f"for {instance.year}. "
                f"Festival date: {instance.festival_date}."
            ),
            notification_type="FESTIVAL",
        )