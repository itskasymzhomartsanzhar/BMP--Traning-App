import uuid
from django.conf import settings
from django.db import models


class NutritionDay(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='nutrition_days', verbose_name='Пользователь')
    date = models.DateField('Дата')
    target_calories = models.PositiveIntegerField('Цель: калории, ккал', default=2200)
    target_protein = models.PositiveIntegerField('Цель: белки, г', default=170)
    target_fats = models.PositiveIntegerField('Цель: жиры, г', default=70)
    target_carbs = models.PositiveIntegerField('Цель: углеводы, г', default=230)
    target_water_liters = models.FloatField('Цель: вода, л', default=2.5)
    water_liters = models.FloatField('Выпито воды, л', default=0.0)

    class Meta:
        unique_together = ['user', 'date']
        verbose_name = 'День питания'
        verbose_name_plural = 'Дни питания'
        ordering = ['-date']

    def __str__(self):
        return f'{self.user} — {self.date}'

    @property
    def eaten_calories(self):
        return sum(m.calories for m in self.meals.filter(status='eaten'))

    @property
    def eaten_protein(self):
        return sum(m.protein for m in self.meals.filter(status='eaten'))

    @property
    def eaten_fats(self):
        return sum(m.fats for m in self.meals.filter(status='eaten'))

    @property
    def eaten_carbs(self):
        return sum(m.carbs for m in self.meals.filter(status='eaten'))


class Meal(models.Model):
    TYPE_CHOICES = [
        ('breakfast', 'Завтрак'),
        ('lunch', 'Обед'),
        ('snack', 'Перекус'),
        ('dinner', 'Ужин'),
    ]
    STATUS_CHOICES = [
        ('planned', 'План'),
        ('eaten', 'Съедено'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    day = models.ForeignKey(NutritionDay, on_delete=models.CASCADE, related_name='meals', verbose_name='День питания')
    meal_type = models.CharField('Тип приёма', max_length=20, choices=TYPE_CHOICES)
    title = models.CharField('Название', max_length=200)
    scheduled_time = models.TimeField('Время по плану')
    calories = models.PositiveIntegerField('Калории, ккал', default=0)
    protein = models.PositiveIntegerField('Белки, г', default=0)
    fats = models.PositiveIntegerField('Жиры, г', default=0)
    carbs = models.PositiveIntegerField('Углеводы, г', default=0)
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='planned')

    class Meta:
        verbose_name = 'Приём пищи'
        verbose_name_plural = 'Приёмы пищи'
        ordering = ['scheduled_time']

    def __str__(self):
        return f'{self.get_meal_type_display()} — {self.day.date}'

    @property
    def status_display(self):
        return 'Съедено' if self.status == 'eaten' else 'План'


class MealItem(models.Model):
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name='items', verbose_name='Приём пищи')
    description = models.CharField('Продукт', max_length=300)

    class Meta:
        verbose_name = 'Продукт в приёме пищи'
        verbose_name_plural = 'Продукты в приёмах пищи'

    def __str__(self):
        return self.description


class Recipe(models.Model):
    id = models.CharField(
        'Код рецепта',
        max_length=50,
        primary_key=True,
        help_text='Латиницей, без пробелов. Например: chicken-rice. После создания не меняется.',
    )
    title = models.CharField('Название', max_length=200)
    calories = models.PositiveIntegerField('Калории, ккал')
    protein = models.PositiveIntegerField('Белки, г')
    fats = models.PositiveIntegerField('Жиры, г')
    carbs = models.PositiveIntegerField('Углеводы, г')
    prep_minutes = models.PositiveIntegerField('Время приготовления, мин')
    ingredients = models.JSONField(
        'Ингредиенты',
        default=list,
        help_text='Список в кавычках через запятую: ["200 г курицы", "1 ст. л. масла"]',
    )
    steps = models.JSONField(
        'Шаги приготовления',
        default=list,
        help_text='Список в кавычках через запятую: ["Нарезать курицу", "Обжарить 10 минут"]',
    )
    is_active = models.BooleanField('Показывать в приложении', default=True)

    class Meta:
        verbose_name = 'Рецепт'
        verbose_name_plural = 'Рецепты'
        ordering = ['title']

    def __str__(self):
        return self.title

    @property
    def macros_display(self):
        return f'Б {self.protein} · Ж {self.fats} · У {self.carbs}'

    @property
    def time_display(self):
        return f'{self.prep_minutes} мин'
