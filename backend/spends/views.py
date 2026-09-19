from collections import defaultdict
from decimal import Decimal

from django.db.models import Sum, Count, F, DecimalField, ExpressionWrapper
from django.db.models.functions import TruncMonth

from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Spend
from .serializers import SpendSerializer


class SpendViewSet(viewsets.ModelViewSet):
    queryset = Spend.objects.all().order_by("-date")
    serializer_class = SpendSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = [
        "business_unit",
        "category",
        "vendor",
        "location",
        "status",
        "priority",
        "payment_method",
        "department",
    ]

    search_fields = [
        "vendor",
        "category",
        "business_unit",
        "location",
        "department",
    ]

    ordering_fields = [
        "date",
        "budget",
        "actual_spend",
        "category",
        "vendor",
        "savings",
    ]


def apply_dashboard_filters(queryset, request):
    """
    Apply the global dashboard filters to a Spend queryset.
    """

    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")

    business_unit = request.query_params.get("business_unit")
    category = request.query_params.get("category")
    vendor = request.query_params.get("vendor")
    location = request.query_params.get("location")
    status = request.query_params.get("status")

    if date_from:
        queryset = queryset.filter(date__gte=date_from)

    if date_to:
        queryset = queryset.filter(date__lte=date_to)

    if business_unit:
        queryset = queryset.filter(business_unit=business_unit)

    if category:
        queryset = queryset.filter(category=category)

    if vendor:
        queryset = queryset.filter(vendor=vendor)

    if location:
        queryset = queryset.filter(location=location)

    if status:
        queryset = queryset.filter(status=status)

    return queryset


def decimal_to_float(value):
    if value is None:
        return 0.0
    return float(value)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):

    queryset = Spend.objects.all()

    # --------------------------------------------------
    # APPLY GLOBAL FILTERS
    # --------------------------------------------------

    queryset = apply_dashboard_filters(queryset, request)

    # --------------------------------------------------
    # KPI CALCULATIONS
    # --------------------------------------------------

    totals = queryset.aggregate(
        total_budget=Sum("budget"),
        total_spend=Sum("actual_spend"),
    )

    total_budget = totals["total_budget"] or Decimal("0")
    total_spend = totals["total_spend"] or Decimal("0")

    total_savings = total_budget - total_spend

    if total_budget:
        savings_percentage = (total_savings / total_budget) * Decimal("100")
    else:
        savings_percentage = Decimal("0")

    over_budget_count = queryset.filter(
        actual_spend__gt=F("budget")
    ).count()

    approved_count = queryset.filter(
        status="Approved"
    ).count()

    total_records = queryset.count()

    average_spend = (
        total_spend / total_records
        if total_records
        else Decimal("0")
    )

    # --------------------------------------------------
    # MONTHLY CHART DATA
    # Line / Area chart
    # --------------------------------------------------

    monthly_data = (
        queryset
        .annotate(month=TruncMonth("date"))
        .values("month")
        .annotate(
            budget=Sum("budget"),
            actual_spend=Sum("actual_spend"),
        )
        .order_by("month")
    )

    monthly = []

    for row in monthly_data:
        month = row["month"]

        monthly.append({
            "month": month.strftime("%Y-%m") if month else "",
            "budget": decimal_to_float(row["budget"]),
            "actual_spend": decimal_to_float(row["actual_spend"]),
            "savings": decimal_to_float(
                (row["budget"] or Decimal("0"))
                - (row["actual_spend"] or Decimal("0"))
            ),
        })

    # --------------------------------------------------
    # CATEGORY DATA
    # Bar / Pie chart
    # --------------------------------------------------

    category_data = (
        queryset
        .values("category")
        .annotate(
            budget=Sum("budget"),
            actual_spend=Sum("actual_spend"),
            count=Count("id"),
        )
        .order_by("-actual_spend")
    )

    categories = []

    for row in category_data:

        budget = row["budget"] or Decimal("0")
        spend = row["actual_spend"] or Decimal("0")

        categories.append({
            "category": row["category"],
            "budget": decimal_to_float(budget),
            "actual_spend": decimal_to_float(spend),
            "savings": decimal_to_float(budget - spend),
            "count": row["count"],
        })

    # --------------------------------------------------
    # BUSINESS UNIT DATA
    # Stacked Bar
    # --------------------------------------------------

    business_unit_data = (
        queryset
        .values("business_unit")
        .annotate(
            budget=Sum("budget"),
            actual_spend=Sum("actual_spend"),
            count=Count("id"),
        )
        .order_by("-actual_spend")
    )

    business_units = []

    for row in business_unit_data:

        budget = row["budget"] or Decimal("0")
        spend = row["actual_spend"] or Decimal("0")

        business_units.append({
            "business_unit": row["business_unit"],
            "budget": decimal_to_float(budget),
            "actual_spend": decimal_to_float(spend),
            "savings": decimal_to_float(budget - spend),
            "count": row["count"],
        })

    # --------------------------------------------------
    # STATUS DATA
    # Pie / Donut
    # --------------------------------------------------

    status_data = (
        queryset
        .values("status")
        .annotate(
            count=Count("id"),
            actual_spend=Sum("actual_spend"),
        )
        .order_by("-count")
    )

    statuses = []

    for row in status_data:
        statuses.append({
            "status": row["status"],
            "count": row["count"],
            "actual_spend": decimal_to_float(row["actual_spend"]),
        })

    # --------------------------------------------------
    # VENDOR DATA
    # --------------------------------------------------

    vendor_data = (
        queryset
        .values("vendor")
        .annotate(
            budget=Sum("budget"),
            actual_spend=Sum("actual_spend"),
            count=Count("id"),
        )
        .order_by("-actual_spend")[:10]
    )

    vendors = []

    for row in vendor_data:

        budget = row["budget"] or Decimal("0")
        spend = row["actual_spend"] or Decimal("0")

        vendors.append({
            "vendor": row["vendor"],
            "budget": decimal_to_float(budget),
            "actual_spend": decimal_to_float(spend),
            "savings": decimal_to_float(budget - spend),
            "count": row["count"],
        })

    # --------------------------------------------------
    # LOCATION DATA
    # --------------------------------------------------

    location_data = (
        queryset
        .values("location")
        .annotate(
            budget=Sum("budget"),
            actual_spend=Sum("actual_spend"),
            count=Count("id"),
        )
        .order_by("-actual_spend")
    )

    locations = []

    for row in location_data:

        budget = row["budget"] or Decimal("0")
        spend = row["actual_spend"] or Decimal("0")

        locations.append({
            "location": row["location"],
            "budget": decimal_to_float(budget),
            "actual_spend": decimal_to_float(spend),
            "savings": decimal_to_float(budget - spend),
            "count": row["count"],
        })

    # --------------------------------------------------
    # DYNAMIC INSIGHTS
    # --------------------------------------------------

    insights = []

    if total_records == 0:

        insights.append(
            "No spend records match the selected filters."
        )

    else:

        # Insight 1: savings
        if total_savings >= 0:
            insights.append(
                f"Total savings are ₹{total_savings:,.0f}, "
                f"representing {savings_percentage:.1f}% "
                f"of the total budget."
            )
        else:
            insights.append(
                f"Overall spending is ₹{abs(total_savings):,.0f} "
                f"above the allocated budget."
            )

        # Insight 2: over budget
        if over_budget_count:
            insights.append(
                f"{over_budget_count} of {total_records} "
                f"records are over budget."
            )
        else:
            insights.append(
                "No records are currently above their allocated budget."
            )

        # Insight 3: highest spending category
        if categories:
            highest_category = categories[0]

            insights.append(
                f"{highest_category['category']} has the highest "
                f"actual spend at ₹"
                f"{highest_category['actual_spend']:,.0f}."
            )

        # Insight 4: highest spending business unit
        if business_units:
            highest_bu = business_units[0]

            insights.append(
                f"{highest_bu['business_unit']} has the highest "
                f"actual spend among business units at ₹"
                f"{highest_bu['actual_spend']:,.0f}."
            )

        # Insight 5: largest savings
        if categories:

            highest_saving_category = max(
                categories,
                key=lambda x: x["savings"]
            )

            insights.append(
                f"{highest_saving_category['category']} "
                f"has the largest category-level savings of ₹"
                f"{highest_saving_category['savings']:,.0f}."
            )

        # Insight 6: average spend
        insights.append(
            f"Average actual spend per record is approximately "
            f"₹{average_spend:,.0f}."
        )

    # --------------------------------------------------
    # FILTER OPTIONS
    # --------------------------------------------------

    filter_source = Spend.objects.all()

    filter_options = {
        "business_units": list(
            filter_source
            .values_list("business_unit", flat=True)
            .distinct()
            .order_by("business_unit")
        ),
        "categories": list(
            filter_source
            .values_list("category", flat=True)
            .distinct()
            .order_by("category")
        ),
        "vendors": list(
            filter_source
            .values_list("vendor", flat=True)
            .distinct()
            .order_by("vendor")
        ),
        "locations": list(
            filter_source
            .values_list("location", flat=True)
            .distinct()
            .order_by("location")
        ),
        "statuses": list(
            filter_source
            .values_list("status", flat=True)
            .distinct()
            .order_by("status")
        ),
    }

    # --------------------------------------------------
    # FINAL RESPONSE
    # --------------------------------------------------

    return Response({

        "kpis": {
            "total_budget": decimal_to_float(total_budget),
            "total_spend": decimal_to_float(total_spend),
            "total_savings": decimal_to_float(total_savings),
            "savings_percentage": round(
                decimal_to_float(savings_percentage), 2
            ),
            "over_budget_count": over_budget_count,
            "approved_count": approved_count,
            "total_records": total_records,
            "average_spend": decimal_to_float(average_spend),
        },

        "charts": {
            "monthly": monthly,
            "categories": categories,
            "business_units": business_units,
            "statuses": statuses,
            "vendors": vendors,
            "locations": locations,
        },

        "insights": insights,

        "filters": filter_options,
    })