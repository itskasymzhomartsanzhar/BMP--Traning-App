from django.contrib import admin
from .models import ExerciseTemplate, WorkoutProgram, WorkoutExercise, WorkoutSession, ExerciseLog


@admin.register(ExerciseTemplate)
class ExerciseTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'muscle']
    list_filter = ['muscle']
    search_fields = ['name', 'slug', 'muscle']


class WorkoutExerciseInline(admin.TabularInline):
    model = WorkoutExercise
    extra = 0
    fields = ['position', 'template', 'sets', 'reps', 'weight', 'rest_seconds']
    ordering = ['position']
    autocomplete_fields = ['template']


@admin.register(WorkoutProgram)
class WorkoutProgramAdmin(admin.ModelAdmin):
    list_display = ['title', 'id', 'mode', 'intensity', 'duration_minutes', 'calories', 'is_featured', 'is_active']
    list_filter = ['mode', 'intensity', 'is_featured', 'is_active']
    search_fields = ['title', 'description']
    inlines = [WorkoutExerciseInline]
    list_editable = ['is_featured', 'is_active']


class ExerciseLogInline(admin.TabularInline):
    model = ExerciseLog
    extra = 0
    readonly_fields = ['template', 'sets', 'reps', 'weight', 'was_swapped', 'was_skipped']


@admin.register(WorkoutSession)
class WorkoutSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'workout', 'status', 'started_at', 'elapsed_seconds']
    list_filter = ['status']
    search_fields = ['user__display_name', 'user__first_name', 'user__tg_id']
    readonly_fields = ['id', 'started_at']
    inlines = [ExerciseLogInline]
    list_select_related = ['user', 'workout']
    autocomplete_fields = ['user', 'workout']
