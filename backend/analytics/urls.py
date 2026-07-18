from django.urls import path
from .views import ActivityView, StreakView, WeightHistoryView, MeasurementsView, ProgressPhotosView

urlpatterns = [
    path('analytics/activity/', ActivityView.as_view()),
    path('analytics/streak/', StreakView.as_view()),
    path('analytics/weight/', WeightHistoryView.as_view()),
    path('analytics/measurements/', MeasurementsView.as_view()),
    path('analytics/photos/', ProgressPhotosView.as_view()),
]
