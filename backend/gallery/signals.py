from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import FestivalPhoto
from user_notifications.models import Notification


@receiver(post_save, sender=FestivalPhoto)
def create_gallery_notification(sender, instance, created, **kwargs):

    if created:
        Notification.objects.create(
            title="New Gallery Photo Added",
            message=(
                f"A new photo '{instance.title}' has been added "
                f"to the {instance.festival.festival_name} festival gallery."
            ),
            notification_type="GALLERY",
        )