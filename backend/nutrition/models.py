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
