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


class FoodEntry(models.Model):
    """Запись в дневнике съеденного. КБЖУ храним итогом на порцию,
    а не на 100 г — так запись не зависит от пересчётов."""

    SOURCE_CHOICES = [
        ('photo', 'Фото'),
        ('voice', 'Голос'),
        ('barcode', 'Штрих-код'),
        ('manual', 'Вручную'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='food_entries', verbose_name='Пользователь')
    date = models.DateField('Дата')
    name = models.CharField('Название', max_length=200)
    grams = models.FloatField('Порция, г', null=True, blank=True)
    calories = models.FloatField('Калории, ккал')
    protein = models.FloatField('Белки, г', default=0)
    fats = models.FloatField('Жиры, г', default=0)
    carbs = models.FloatField('Углеводы, г', default=0)
    source = models.CharField('Источник', max_length=10, choices=SOURCE_CHOICES, default='manual')
    created_at = models.DateTimeField('Добавлено', auto_now_add=True)

    class Meta:
        verbose_name = 'Приём пищи'
        verbose_name_plural = 'Дневник питания'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'date'])]

    def __str__(self):
        return f'{self.user} — {self.name} ({self.date})'
