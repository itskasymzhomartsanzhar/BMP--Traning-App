from django.urls import path
from .views import SubscriptionPlansView, MySubscriptionView, CreatePaymentView, YooKassaWebhookView

urlpatterns = [
    path('subscriptions/plans/', SubscriptionPlansView.as_view()),
    path('subscriptions/me/', MySubscriptionView.as_view()),
    path('subscriptions/', CreatePaymentView.as_view()),
    path('webhooks/yookassa/', YooKassaWebhookView.as_view()),
]
