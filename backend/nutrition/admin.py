from django.contrib import admin
from .models import NutritionDay, FoodEntry


@admin.register(NutritionDay)
class NutritionDayAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'target_calories', 'water_liters']
    list_filter = ['date']
    search_fields = ['user__display_name', 'user__tg_id']
    list_select_related = ['user']
    autocomplete_fields = ['user']


@admin.register(FoodEntry)
class FoodEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'name', 'grams', 'calories', 'source']
    list_filter = ['date', 'source']
    search_fields = ['name', 'user__display_name', 'user__tg_id']
    list_select_related = ['user']
    autocomplete_fields = ['user']
