from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("admin_details", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="admindetail",
            name="alternate_phone",
            field=models.CharField(blank=True, max_length=20),
        ),
    ]
