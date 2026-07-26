from django.contrib import admin
from .models import WeightEntry, BodyMeasurement, ProgressPhoto


@admin.register(WeightEntry)
class WeightEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'value', 'recorded_at']
    list_filter = ['recorded_at']
    search_fields = ['user__display_name', 'user__tg_id']
    list_select_related = ['user']
    autocomplete_fields = ['user']


@admin.register(BodyMeasurement)
class BodyMeasurementAdmin(admin.ModelAdmin):
    list_display = ['user', 'recorded_at', 'weight', 'neck_cm', 'chest_cm', 'waist_cm', 'hip_cm']
    list_filter = ['recorded_at']
    search_fields = ['user__display_name', 'user__tg_id']
    list_select_related = ['user']
    autocomplete_fields = ['user']


@admin.register(ProgressPhoto)
class ProgressPhotoAdmin(admin.ModelAdmin):
    list_display = ['user', 'taken_date', 'angle']
    list_filter = ['angle']
    search_fields = ['user__display_name', 'user__tg_id']
    list_select_related = ['user']
    autocomplete_fields = ['user']
