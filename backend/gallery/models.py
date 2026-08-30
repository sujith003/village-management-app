from django.db import models

from festivals.models import Festival


class FestivalPhoto(models.Model):

    festival = models.ForeignKey(
        Festival,
        on_delete=models.CASCADE,
        related_name="photos",
    )

    title = models.CharField(
        max_length=150
    )

    image = models.ImageField(
        upload_to="festival_photos/"
    )

    description = models.TextField(
        blank=True
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title