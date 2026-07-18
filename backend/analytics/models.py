from django.conf import settings
from django.db import models


class WeightEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='weight_entries', verbose_name='Пользователь')
    value = models.FloatField('Вес, кг')
    recorded_at = models.DateField('Дата замера')

    class Meta:
        verbose_name = 'Вес'
        verbose_name_plural = 'История веса'
        ordering = ['-recorded_at']
        unique_together = ['user', 'recorded_at']

    def __str__(self):
        return f'{self.user} — {self.value} кг ({self.recorded_at})'


class BodyMeasurement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='measurements', verbose_name='Пользователь')
    recorded_at = models.DateField('Дата замера')
    weight = models.FloatField('Вес, кг', null=True, blank=True)
    body_fat_percent = models.FloatField('Процент жира, %', null=True, blank=True)
    muscle_mass = models.FloatField('Мышечная масса, кг', null=True, blank=True)
    waist_cm = models.IntegerField('Талия, см', null=True, blank=True)
    chest_cm = models.IntegerField('Грудь, см', null=True, blank=True)
    hip_cm = models.IntegerField('Бёдра, см', null=True, blank=True)

    class Meta:
        verbose_name = 'Замер тела'
        verbose_name_plural = 'Замеры тела'
        ordering = ['-recorded_at']

    def __str__(self):
        return f'{self.user} — {self.recorded_at}'


class ProgressPhoto(models.Model):
    ANGLE_CHOICES = [('front', 'Спереди'), ('side', 'Сбоку'), ('back', 'Сзади')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress_photos', verbose_name='Пользователь')
    taken_date = models.DateField('Дата съёмки')
    angle = models.CharField('Ракурс', max_length=10, choices=ANGLE_CHOICES, default='front')
    image = models.ImageField('Фотография', upload_to='progress_photos/', blank=True)

    class Meta:
        verbose_name = 'Фото прогресса'
        verbose_name_plural = 'Фото прогресса'
        ordering = ['-taken_date']

    def __str__(self):
        return f'{self.user} — {self.taken_date} ({self.angle})'
