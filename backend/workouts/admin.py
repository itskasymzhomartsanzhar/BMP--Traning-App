from django import forms
from django.contrib import admin
from .kinescope import KinescopeError, upload_video
from .models import ExerciseTemplate, WorkoutProgram, WorkoutExercise, WorkoutSession, ExerciseLog

MAX_VIDEO_SIZE = 1024 * 1024 * 1024  # 1 ГБ


class ExerciseTemplateForm(forms.ModelForm):
    video_file = forms.FileField(
        label='Загрузить видео',
        required=False,
        help_text='MP4/MOV до 1 ГБ. Файл уйдёт на Kinescope, ID подставится автоматически. '
                  'Обработка занимает пару минут после сохранения.',
        widget=forms.ClearableFileInput(attrs={'accept': 'video/*'}),
    )

    class Meta:
        model = ExerciseTemplate
        fields = '__all__'

    def clean_video_file(self):
        file = self.cleaned_data.get('video_file')
        if not file:
            return file
        if file.size > MAX_VIDEO_SIZE:
            raise forms.ValidationError('Файл больше 1 ГБ — сожмите видео.')
        if file.content_type and not file.content_type.startswith('video/'):
            raise forms.ValidationError('Это не видеофайл.')
        return file

    def clean(self):
        cleaned = super().clean()
        file = cleaned.get('video_file')
        if file:
            # Загружаем прямо при валидации: если Kinescope откажет,
            # форма покажет ошибку и ничего не сохранится.
            try:
                cleaned['kinescope_id'] = upload_video(file, self.cleaned_data.get('name') or file.name)
            except KinescopeError as exc:
                raise forms.ValidationError(str(exc))
        return cleaned

    def save(self, commit=True):
        instance = super().save(commit=False)
        uploaded_id = self.cleaned_data.get('kinescope_id')
        if self.cleaned_data.get('video_file') and uploaded_id:
            instance.kinescope_id = uploaded_id
        if commit:
            instance.save()
        return instance


@admin.register(ExerciseTemplate)
class ExerciseTemplateAdmin(admin.ModelAdmin):
    form = ExerciseTemplateForm
    list_display = ['name', 'slug', 'muscle', 'has_video']
    list_filter = ['muscle']
    search_fields = ['name', 'slug', 'muscle']
    fields = ['slug', 'name', 'description', 'muscle', 'video_file', 'kinescope_id', 'video_url']

    @admin.display(description='Видео', boolean=True)
    def has_video(self, obj):
        return bool(obj.kinescope_id or obj.video_url)


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
