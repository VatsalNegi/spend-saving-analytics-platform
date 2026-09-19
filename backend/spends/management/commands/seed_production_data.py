from django.core.management import call_command
from django.core.management.base import BaseCommand
from spends.models import Spend


class Command(BaseCommand):
    help = "Import sample Excel data only when the Spend table is empty."

    def handle(self, *args, **options):
        if Spend.objects.exists():
            self.stdout.write(
                self.style.WARNING(
                    "Spend records already exist; skipping sample data import."
                )
            )
            return

        self.stdout.write("No spend records found. Importing sample data...")

        call_command("import_excel")

        self.stdout.write(
            self.style.SUCCESS(
                "Sample data import completed successfully."
            )
        )