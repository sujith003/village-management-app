from django.db import models
from festivals.models import Festival


class Expense(models.Model):

    CATEGORY_CHOICES = [
        ("MELAM", "Melam"),
        ("CRACKERS", "Crackers"),
        ("DECORATION", "Decoration"),
        ("SOUND", "Sound System"),
        ("THER", "Ther"),
        ("FOOD", "Food"),
        ("OTHER", "Other"),
    ]

    festival = models.ForeignKey(
        Festival,
        on_delete=models.CASCADE,
        related_name="expenses",
    )

    expense_title = models.CharField(max_length=150)

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    # New field
    advance_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    expense_date = models.DateField()

    description = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"{self.expense_title} - ₹{self.amount}"