from rest_framework import serializers
from .models import Spend


class SpendSerializer(serializers.ModelSerializer):

    savings = serializers.ReadOnlyField()
    savings_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Spend
        fields = [
            'id',
            'date',
            'department',
            'business_unit',
            'category',
            'vendor',
            'location',
            'budget',
            'actual_spend',
            'savings',
            'savings_percentage',
            'status',
            'priority',
            'payment_method',
            'created_at',
            'updated_at',
        ]