from datetime import date

from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    gender_display = serializers.SerializerMethodField()
    goal_display = serializers.SerializerMethodField()
    age = serializers.ReadOnlyField()
    is_onboarded = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'tg_id', 'username', 'first_name', 'display_name', 'name',
            'email', 'avatar_url', 'gender', 'gender_display', 'weight', 'height',
            'goal', 'goal_display', 'birth_date', 'age', 'level', 'place', 'injuries',
            'is_onboarded', 'onboarded_at', 'recommended_program',
            'push_notifications', 'email_newsletter', 'language', 'units',
            'workout_count', 'training_days', 'created_at',
        ]
        read_only_fields = [
            'id', 'tg_id', 'username', 'first_name', 'avatar_url', 'workout_count',
            'created_at', 'onboarded_at', 'recommended_program',
        ]

    def get_name(self, obj):
        return obj.name

    def get_gender_display(self, obj):
        return dict(User.GENDER_CHOICES).get(obj.gender, '')

    def get_goal_display(self, obj):
        return dict(User.GOAL_CHOICES).get(obj.goal, '')


class OnboardingSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    birth_date = serializers.DateField()
    gender = serializers.ChoiceField(choices=[c[0] for c in User.GENDER_CHOICES], required=False, allow_blank=True)
    height = serializers.IntegerField(min_value=80, max_value=250)
    weight = serializers.FloatField(min_value=20, max_value=300)
    goal = serializers.ChoiceField(choices=[c[0] for c in User.GOAL_CHOICES])
    level = serializers.ChoiceField(choices=[c[0] for c in User.LEVEL_CHOICES])
    # Необязательное: при уровне «Своя программа» место не спрашивается.
    place = serializers.ChoiceField(
        choices=[c[0] for c in User.PLACE_CHOICES], required=False, allow_blank=True,
    )
    injuries = serializers.ListField(
        child=serializers.ChoiceField(choices=[c[0] for c in User.INJURY_CHOICES]),
        required=False,
        allow_empty=True,
    )
    training_days = serializers.ListField(
        child=serializers.ChoiceField(choices=['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
        required=False,
        allow_empty=True,
    )

    def validate_name(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError('Укажите имя.')
        return cleaned

    def validate_birth_date(self, value):
        today = date.today()
        if value > today:
            raise serializers.ValidationError('Дата рождения не может быть в будущем.')
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 14:
            raise serializers.ValidationError('Приложение доступно с 14 лет.')
        if age > 100:
            raise serializers.ValidationError('Проверьте дату рождения.')
        return value

    def validate_injuries(self, value):
        # «Нет травм» несовместимо с конкретными травмами.
        if 'none' in value and len(value) > 1:
            return [i for i in value if i != 'none']
        return value

    def validate(self, data):
        if data.get('level') != 'custom' and not data.get('place'):
            raise serializers.ValidationError({'place': 'Выберите, где будете тренироваться.'})
        return data


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['display_name', 'email', 'gender', 'birth_date', 'weight', 'height', 'goal',
                  'level', 'place', 'injuries',
                  'push_notifications', 'email_newsletter', 'language', 'units', 'training_days']

    def validate_weight(self, value):
        if value is not None and not (20 <= value <= 300):
            raise serializers.ValidationError('Вес должен быть от 20 до 300 кг.')
        return value

    def validate_height(self, value):
        if value is not None and not (80 <= value <= 250):
            raise serializers.ValidationError('Рост должен быть от 80 до 250 см.')
        return value

    def validate_gender(self, value):
        valid = [c[0] for c in User.GENDER_CHOICES]
        if value and value not in valid:
            raise serializers.ValidationError(f'Допустимые значения: {valid}')
        return value

    def validate_goal(self, value):
        valid = [c[0] for c in User.GOAL_CHOICES]
        if value and value not in valid:
            raise serializers.ValidationError(f'Допустимые значения: {valid}')
        return value


class AuthedOnboardingSerializer(OnboardingSerializer):
    """Анкета авторизованного пользователя; Telegram-аккаунт заодно задаёт почту и пароль."""
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(min_length=8, max_length=128, write_only=True, required=False, allow_blank=True)

    def validate_email(self, value):
        email = value.strip().lower()
        if not email:
            return ''
        user = self.context.get('user')
        queryset = User.objects.filter(email__iexact=email).exclude(email='')
        if user is not None and user.pk:
            queryset = queryset.exclude(pk=user.pk)
        if queryset.exists():
            raise serializers.ValidationError('Эта почта уже зарегистрирована. Попробуйте войти.')
        return email


class EmailRegisterSerializer(OnboardingSerializer):
    """Анкета + учётные данные: гость проходит опрос до создания аккаунта."""
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=128, write_only=True)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exclude(email='').exists():
            raise serializers.ValidationError('Эта почта уже зарегистрирована. Попробуйте войти.')
        return email


class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(max_length=128, write_only=True)
