from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import SpendViewSet, dashboard


router = DefaultRouter()

router.register(
    r"spends",
    SpendViewSet,
    basename="spend"
)


urlpatterns = [

    path(
        "dashboard/",
        dashboard,
        name="dashboard"
    ),

    path(
        "",
        include(router.urls)
    ),
]