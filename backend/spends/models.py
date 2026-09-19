from django.db import models


class Spend(models.Model):

    STATUS_CHOICES = [
    ('Approved', 'Approved'),
    ('Over Budget', 'Over Budget'),
]

    PRIORITY_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]

    PAYMENT_METHOD_CHOICES = [
    ('Monthly', 'Monthly'),
    ('Purchase Order', 'Purchase Order'),
    ('Project', 'Project'),
    ('Annual Contract', 'Annual Contract'),
    ('Corporate Card', 'Corporate Card'),
]

    date = models.DateField()

    department = models.CharField(max_length=100)

    business_unit = models.CharField(max_length=100)

    category = models.CharField(max_length=100)

    vendor = models.CharField(max_length=150)

    location = models.CharField(max_length=100)

    budget = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    actual_spend = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES
    )

    payment_method = models.CharField(
        max_length=30,
        choices=PAYMENT_METHOD_CHOICES
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    @property
    def savings(self):
        return self.budget - self.actual_spend

    @property
    def savings_percentage(self):
        if self.budget == 0:
            return 0

        return (self.savings / self.budget) * 100

    def __str__(self):
        return f"{self.vendor} - {self.category}"