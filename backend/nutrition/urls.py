from django.urls import path
from .views import NutritionDayView, WaterView, MealListView, MealDetailView, RecipeListView, RecipeDetailView

urlpatterns = [
    path('nutrition/daily/', NutritionDayView.as_view()),
    path('nutrition/water/', WaterView.as_view()),
    path('nutrition/meals/', MealListView.as_view()),
    path('nutrition/meals/<uuid:meal_id>/', MealDetailView.as_view()),
    path('recipes/', RecipeListView.as_view()),
    path('recipes/<str:recipe_id>/', RecipeDetailView.as_view()),
]
