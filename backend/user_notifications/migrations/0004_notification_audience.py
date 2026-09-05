from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("user_notifications", "0003_alter_notification_notification_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="notification",
            name="audience",
            field=models.CharField(
                choices=[("ALL", "All Users"), ("ADMIN", "Admin Only")],
                default="ALL",
                max_length=10,
            ),
        ),
        migrations.AlterField(
            model_name="notification",
            name="notification_type",
            field=models.CharField(
                choices=[
                    ("FESTIVAL", "Festival"),
                    ("GALLERY", "Gallery"),
                    ("ANNOUNCEMENT", "Announcement"),
                    ("PAYMENT", "Payment Reminder"),
                    ("FAMILY_FUNCTION", "Family Function"),
                ],
                max_length=20,
            ),
        ),
    ]