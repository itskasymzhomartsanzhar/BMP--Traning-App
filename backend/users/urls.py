from django.urls import path
from .views import (
    TelegramAuthView, TokenRefreshView, MeView, DashboardView,
    TrainingScheduleView, OnboardingView,
    PlanPreviewView, EmailRegisterView, EmailLoginView,
    TelegramWidgetAuthView, LinkTelegramView,
)

urlpatterns = [
    path('auth/telegram/', TelegramAuthView.as_view()),
    path('auth/telegram-widget/', TelegramWidgetAuthView.as_view()),
    path('auth/register/', EmailRegisterView.as_view()),
    path('auth/login/', EmailLoginView.as_view()),
    path('auth/plan-preview/', PlanPreviewView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('users/me/', MeView.as_view()),
    path('users/me/dashboard/', DashboardView.as_view()),
    path('users/me/training-schedule/', TrainingScheduleView.as_view()),
    path('users/me/onboarding/', OnboardingView.as_view()),
    path('users/me/link-telegram/', LinkTelegramView.as_view()),
]
