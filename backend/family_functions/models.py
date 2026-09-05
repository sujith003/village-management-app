from django.db import models


class FamilyFunction(models.Model):

    FUNCTION_TYPES = [
        ("WEDDING", "Wedding"),
        ("HOUSE_WARMING", "House Warming"),
        ("BIRTHDAY", "Birthday"),
        ("PUBERTY", "Puberty Ceremony"),
        ("NAMING", "Naming Ceremony"),
        ("ENGAGEMENT", "Engagement"),
        ("OTHER", "Other"),
    ]

    STATUS_CHOICES = [
        ("PENDING", "Pending Approval"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    host_name = models.CharField(max_length=150)
    host_address = models.CharField(max_length=255)
    host_mobile = models.CharField(max_length=20)

    function_type = models.CharField(max_length=20, choices=FUNCTION_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    function_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    food_details = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255)
    additional_details = models.TextField(blank=True)

    invitation_image = models.ImageField(
        upload_to="family_functions/",
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title