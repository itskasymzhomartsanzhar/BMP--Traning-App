from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from .models import User

# Служебные разделы: JWT-токены и группы прав проектом не используются.
admin.site.unregister(BlacklistedToken)
admin.site.unregister(OutstandingToken)
admin.site.unregister(Group)


class UserCreationForm(forms.ModelForm):
    """Пользователи входят через Telegram, поэтому пароль на создании не спрашиваем.

    Базовая UserCreationForm требует password1/password2, которых нет в add_fieldsets,
    из-за чего форма падала на невидимых для админа полях.
    """

    class Meta:
        model = User
        fields = ['tg_id', 'display_name', 'is_staff', 'is_superuser']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = UserCreationForm
    list_display = ['tg_id', 'display_name', 'first_name', 'username', 'goal', 'level', 'weight', 'workout_count', 'is_staff', 'created_at']
    list_filter = ['goal', 'level', 'place', 'gender', 'is_staff', 'is_active']
    search_fields = ['tg_id', 'username', 'first_name', 'display_name', 'email']
    ordering = ['-created_at']
    readonly_fields = ['tg_id', 'age', 'created_at', 'updated_at', 'last_login']

    @admin.display(description='Возраст')
    def age(self, obj):
        return obj.age if obj.age is not None else '—'

    def get_readonly_fields(self, request, obj=None):
        # При создании tg_id должен быть вводимым, иначе он не дойдёт до save().
        if obj is None:
            return ['created_at', 'updated_at', 'last_login']
        return self.readonly_fields

    fieldsets = (
        ('Telegram', {'fields': ('tg_id', 'username', 'first_name', 'last_name', 'avatar_url')}),
        ('Профиль', {'fields': ('display_name', 'email', 'gender', 'birth_date', 'age', 'weight', 'height', 'goal')}),
        ('Анкета и подбор', {'fields': ('level', 'place', 'injuries', 'recommended_program', 'onboarded_at')}),
        ('Тренировки', {'fields': ('workout_count', 'training_days')}),
        ('Настройки', {'fields': ('push_notifications', 'email_newsletter')}),
        ('Права', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Даты', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        ('Создать пользователя', {
            'classes': ('wide',),
            'fields': ('tg_id', 'display_name', 'is_staff', 'is_superuser'),
        }),
    )

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # BaseUserAdmin подмешивает поле пароля; вход только через Telegram.
        if obj is None:
            form.base_fields.pop('password', None)
        return form

    def save_model(self, request, obj, form, change):
        if not change:
            obj.set_unusable_password()
        super().save_model(request, obj, form, change)
