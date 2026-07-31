from django.contrib import admin
from .models import NutritionDay


@admin.register(NutritionDay)
class NutritionDayAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'target_calories', 'water_liters']
    list_filter = ['date']
    search_fields = ['user__display_name', 'user__tg_id']
    list_select_related = ['user']
    autocomplete_fields = ['user']
