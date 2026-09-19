import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Create the production test admin user if it does not exist."

    def handle(self, *args, **options):
        User = get_user_model()

        username = os.getenv("TEST_ADMIN_USERNAME", "admin")
        password = os.getenv("TEST_ADMIN_PASSWORD")

        if not password:
            self.stdout.write(
                self.style.ERROR(
                    "TEST_ADMIN_PASSWORD environment variable is not set."
                )
            )
            return

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "is_staff": True,
                "is_superuser": True,
            },
        )

        if created:
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f"Test admin user '{username}' created successfully."
                )
            )
        else:
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f"Test admin user '{username}' already exists. Updated password and superuser privileges."
                )
            )