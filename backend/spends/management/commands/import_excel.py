import pandas as pd
from django.core.management.base import BaseCommand
from spends.models import Spend


class Command(BaseCommand):
    help = "Import spend data from Excel file"

    def add_arguments(self, parser):
        parser.add_argument(
            "file_path",
            type=str,
            help="Path to the Excel file"
        )

    def handle(self, *args, **options):
        file_path = options["file_path"]

        try:
            df = pd.read_excel(file_path)

            self.stdout.write(
                self.style.SUCCESS(
                    f"Excel loaded successfully: {len(df)} rows found."
                )
            )

            for _, row in df.iterrows():

                Spend.objects.update_or_create(
                    id=int(row["ID"]),
                    defaults={
                        "date": pd.to_datetime(row["Date"]).date(),
                        "department": str(row["Department"]),
                        "business_unit": str(row["Business Unit"]),
                        "category": str(row["Category"]),
                        "vendor": str(row["Vendor"]),
                        "location": str(row["Location"]),
                        "budget": float(row["Budget"]),
                        "actual_spend": float(row["Actual Spend"]),
                        "status": str(row["Status"]),
                        "priority": str(row["Priority"]),
                        "payment_method": str(row["Payment Method"]),
                    }
                )

            self.stdout.write(
                self.style.SUCCESS(
                    "Excel data imported successfully!"
                )
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(
                    f"Import failed: {str(e)}"
                )
            )