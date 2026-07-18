from django.contrib import admin
from .models import Subscription, Payment


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'is_premium', 'status', 'started_at', 'next_charge_date']
    list_filter = ['plan', 'status']
    search_fields = ['user__display_name', 'user__tg_id']
    readonly_fields = ['started_at']
    list_select_related = ['user']
    autocomplete_fields = ['user']

    @admin.display(description='Premium', boolean=True)
    def is_premium(self, obj):
        return obj.is_premium


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'amount', 'currency', 'status', 'created_at']
    list_filter = ['plan', 'status']
    search_fields = ['user__display_name', 'user__tg_id', 'yookassa_payment_id']
    readonly_fields = ['id', 'created_at', 'updated_at']
    list_select_related = ['user']
    autocomplete_fields = ['user']

    # Платежи заводит ЮKassa — руками их создавать нельзя.
    def has_add_permission(self, request):
        return False
