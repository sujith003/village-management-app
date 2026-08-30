from django.db import models


class ImportantPerson(models.Model):

    name = models.CharField(
        max_length=150
    )

    role = models.CharField(
        max_length=150
    )

    phone = models.CharField(
        max_length=20,
        blank=True
    )

    email = models.EmailField(
        blank=True
    )

    address = models.CharField(
        max_length=255,
        blank=True
    )

    photo = models.ImageField(
        upload_to="important_persons_photos/",
        blank=True,
        null=True
    )

    description = models.TextField(
        blank=True
    )

    display_order = models.PositiveIntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return f"{self.name} ({self.role})"
