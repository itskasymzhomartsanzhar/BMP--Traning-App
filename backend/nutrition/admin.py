from django.contrib import admin
from .models import NutritionDay, Meal, MealItem, Recipe


class MealInline(admin.TabularInline):
    model = Meal
    extra = 0
    fields = ['meal_type', 'title', 'scheduled_time', 'calories', 'status']


@admin.register(NutritionDay)
class NutritionDayAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'target_calories', 'water_liters']
    list_filter = ['date']
    search_fields = ['user__display_name', 'user__tg_id']
    inlines = [MealInline]
    list_select_related = ['user']
    autocomplete_fields = ['user']


class MealItemInline(admin.TabularInline):
    model = MealItem
    extra = 0


@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
    list_display = ['title', 'meal_type', 'scheduled_time', 'calories', 'status', 'day']
    list_filter = ['meal_type', 'status']
    search_fields = ['title', 'day__user__display_name']
    inlines = [MealItemInline]
    list_select_related = ['day', 'day__user']


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ['title', 'calories', 'protein', 'fats', 'carbs', 'prep_minutes', 'is_active']
    list_filter = ['is_active']
    list_editable = ['is_active']
    search_fields = ['title']
