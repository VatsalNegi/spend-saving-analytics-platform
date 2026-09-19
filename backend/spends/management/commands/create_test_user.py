import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Create the production test admin user if it does not exist."

    def handle(self, *args, **options):
        User = get_user_model()

        username = os.getenv("TEST_ADMIN_USERNAME", "admin").strip()
        password = os.getenv("TEST_ADMIN_PASSWORD", "Vatsal@07").strip()

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            },
        )

        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()

        action = "created" if created else "updated"
        self.stdout.write(
            self.style.SUCCESS(
                f"Test admin user '{username}' successfully {action}."
            )
        )