from django.urls import path
from .views import NutritionDayView, WaterView

urlpatterns = [
    path('nutrition/daily/', NutritionDayView.as_view()),
    path('nutrition/water/', WaterView.as_view()),
]
