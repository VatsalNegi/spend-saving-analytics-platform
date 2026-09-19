import os
from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_or_update_test_user(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    username = os.getenv("TEST_ADMIN_USERNAME", "admin").strip()
    password = os.getenv("TEST_ADMIN_PASSWORD", "Vatsal@07").strip()

    user, created = User.objects.get_or_create(username=username)
    user.password = make_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()


class Migration(migrations.Migration):

    dependencies = [
        ('spends', '0003_alter_spend_payment_method'),
    ]

    operations = [
        migrations.RunPython(create_or_update_test_user, reverse_code=migrations.RunPython.noop),
    ]
