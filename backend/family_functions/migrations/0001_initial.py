from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="FamilyFunction",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("host_name", models.CharField(max_length=150)),
                ("host_address", models.CharField(max_length=255)),
                ("host_mobile", models.CharField(max_length=20)),
                (
                    "function_type",
                    models.CharField(
                        choices=[
                            ("WEDDING", "Wedding"),
                            ("HOUSE_WARMING", "House Warming"),
                            ("BIRTHDAY", "Birthday"),
                            ("PUBERTY", "Puberty Ceremony"),
                            ("NAMING", "Naming Ceremony"),
                            ("ENGAGEMENT", "Engagement"),
                            ("OTHER", "Other"),
                        ],
                        max_length=20,
                    ),
                ),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                ("function_date", models.DateField()),
                ("start_time", models.TimeField()),
                ("end_time", models.TimeField()),
                ("food_details", models.CharField(blank=True, max_length=255)),
                ("location", models.CharField(max_length=255)),
                ("additional_details", models.TextField(blank=True)),
                (
                    "invitation_image",
                    models.ImageField(
                        blank=True,
                        null=True,
                        upload_to="family_functions/",
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("PENDING", "Pending Approval"),
                            ("APPROVED", "Approved"),
                            ("REJECTED", "Rejected"),
                        ],
                        default="PENDING",
                        max_length=10,
                    ),
                ),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]