from django.urls import path
from .views import (
    ExerciseListView, ExerciseDetailView,
    WorkoutCatalogView, WorkoutDetailView,
    WorkoutSessionListView, WorkoutSessionDetailView, CompleteSessionView,
)

urlpatterns = [
    path('exercises/', ExerciseListView.as_view()),
    path('exercises/<slug:slug>/', ExerciseDetailView.as_view()),
    path('workouts/', WorkoutCatalogView.as_view()),
    path('workouts/<str:workout_id>/', WorkoutDetailView.as_view()),
    path('sessions/', WorkoutSessionListView.as_view()),
    path('sessions/<uuid:session_id>/', WorkoutSessionDetailView.as_view()),
    path('sessions/<uuid:session_id>/complete/', CompleteSessionView.as_view()),
]
