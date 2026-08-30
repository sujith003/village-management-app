from django.db import models


class ImportantContact(models.Model):

    CATEGORY_CHOICES = [
        ('MELAM', 'Melam'),
        ('CRACKERS', 'Crackers'),
        ('THER', 'Ther'),
        ('DECORATION', 'Decoration'),
        ('SOUND', 'Sound System'),
        ('ELECTRICIAN', 'Electrician'),
        ('PRIEST', 'Priest'),
        ('OTHER', 'Other'),
    ]

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES
    )

    contact_name = models.CharField(max_length=150)

    phone = models.CharField(max_length=15)

    alternate_phone = models.CharField(
        max_length=15,
        blank=True
    )

    remarks = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - {self.contact_name}"