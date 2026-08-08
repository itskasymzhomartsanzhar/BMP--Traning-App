from django.urls import path
from .views import (
    NutritionDayView, WaterView, FoodEntriesView, FoodEntryDetailView,
    AnalyzePhotoView, AnalyzeVoiceView, BarcodeView, FoodSearchView,
)

urlpatterns = [
    path('nutrition/daily/', NutritionDayView.as_view()),
    path('nutrition/water/', WaterView.as_view()),
    path('nutrition/entries/', FoodEntriesView.as_view()),
    path('nutrition/entries/<int:entry_id>/', FoodEntryDetailView.as_view()),
    path('nutrition/ai/photo/', AnalyzePhotoView.as_view()),
    path('nutrition/ai/voice/', AnalyzeVoiceView.as_view()),
    path('nutrition/barcode/<str:code>/', BarcodeView.as_view()),
    path('nutrition/search/', FoodSearchView.as_view()),
]
