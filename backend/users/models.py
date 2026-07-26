from datetime import date

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, tg_id, password=None, **extra_fields):
        user = self.model(tg_id=tg_id, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, tg_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(tg_id, password=password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    GENDER_CHOICES = [
        ('male', 'Мужской'),
        ('female', 'Женский'),
    ]
    GOAL_CHOICES = [
        ('cut', '   Сушка'),
        ('bulk', 'Набор массы'),
        ('maintain', 'Поддержание'),
        ('endurance', 'Выносливость'),
        ('recomp', 'Рекомпозиция'),
    ]
    LEVEL_CHOICES = [
        ('beginner', 'Новичок'),
        ('intermediate', 'Средний'),
        ('advanced', 'Продвинутый'),
    ]
    PLACE_CHOICES = [
        ('gym', 'В зале'),
        ('home', 'Дома'),
    ]
    INJURY_CHOICES = [
        ('none', 'Нет травм'),
        ('knee', 'Колени'),
        ('back', 'Спина · поясница'),
        ('shoulder', 'Плечи'),
        ('wrist', 'Запястья'),
        ('ankle', 'Голеностоп'),
    ]

    # null у аккаунтов, созданных по email; unique допускает несколько NULL
    tg_id = models.BigIntegerField('Telegram ID', unique=True, null=True, blank=True)
    username = models.CharField('Логин в Telegram', max_length=150, blank=True)
    first_name = models.CharField('Имя из Telegram', max_length=150, blank=True)
    last_name = models.CharField('Фамилия из Telegram', max_length=150, blank=True)
    email = models.EmailField('Email', blank=True)
    avatar_url = models.URLField('Ссылка на аватар', blank=True)

    display_name = models.CharField('Отображаемое имя', max_length=150, blank=True)
    gender = models.CharField('Пол', max_length=10, choices=GENDER_CHOICES, blank=True)
    birth_date = models.DateField('Дата рождения', null=True, blank=True)
    weight = models.FloatField('Вес, кг', null=True, blank=True)
    height = models.IntegerField('Рост, см', null=True, blank=True)
    goal = models.CharField('Цель', max_length=20, choices=GOAL_CHOICES, blank=True)
    level = models.CharField('Уровень подготовки', max_length=20, choices=LEVEL_CHOICES, blank=True)
    place = models.CharField('Место тренировок', max_length=10, choices=PLACE_CHOICES, blank=True)
    injuries = models.JSONField('Травмы и ограничения', default=list, blank=True)

    onboarded_at = models.DateTimeField('Анкета пройдена', null=True, blank=True)
    recommended_program = models.CharField('Рекомендованная программа', max_length=50, blank=True)

    push_notifications = models.BooleanField('Push-уведомления', default=True)
    email_newsletter = models.BooleanField('Email-рассылка', default=False)

    workout_count = models.PositiveIntegerField('Всего тренировок', default=0)
    training_days = models.JSONField('Дни тренировок', default=list)

    is_active = models.BooleanField('Активен', default=True)
    is_staff = models.BooleanField('Доступ в админку', default=False)

    created_at = models.DateTimeField('Дата регистрации', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлён', auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'tg_id'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def _fallback_name(self):
        if self.tg_id:
            return f'Пользователь {self.tg_id}'
        if self.email:
            return self.email.split('@')[0]
        return 'Пользователь'

    def __str__(self):
        return self.display_name or self.first_name or self._fallback_name()

    def get_short_name(self):
        # Админка приветствует по короткому имени — без него в шапке висит tg_id.
        return self.display_name or self.first_name or self._fallback_name()

    @property
    def name(self):
        return self.display_name or self.first_name or self._fallback_name()

    @property
    def age(self):
        if not self.birth_date:
            return None
        today = date.today()
        return today.year - self.birth_date.year - (
            (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
        )

    @property
    def is_onboarded(self):
        return self.onboarded_at is not None
