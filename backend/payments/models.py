import uuid
from datetime import date
from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.db import models


class Subscription(models.Model):
    PLAN_CHOICES = [('free', 'Бесплатный'), ('monthly', 'Месячный'), ('annual', 'Годовой')]
    STATUS_CHOICES = [('active', 'Активна'), ('cancelled', 'Отменена'), ('expired', 'Истекла')]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription', verbose_name='Пользователь')
    plan = models.CharField('Тариф', max_length=20, choices=PLAN_CHOICES, default='free')
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='active')
    started_at = models.DateField('Дата начала', auto_now_add=True)
    next_charge_date = models.DateField('Следующее списание', null=True, blank=True)
    yookassa_payment_id = models.CharField('ID платежа в ЮKassa', max_length=100, blank=True)

    class Meta:
        verbose_name = 'Подписка'
        verbose_name_plural = 'Подписки'

    def __str__(self):
        return f'{self.user} — {self.plan} ({self.status})'

    @property
    def is_premium(self):
        return self.plan in ('monthly', 'annual') and self.status == 'active'

    @property
    def plan_display(self):
        return 'Premium' if self.is_premium else 'Free'

    @property
    def next_charge_display(self):
        if self.next_charge_date:
            return self.next_charge_date.strftime('%d.%m.%Y')
        return ''


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидание'),
        ('succeeded', 'Успешно'),
        ('cancelled', 'Отменён'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments', verbose_name='Пользователь')
    plan = models.CharField('Тариф', max_length=20)
    amount = models.PositiveIntegerField('Сумма')
    currency = models.CharField('Валюта', max_length=10, default='RUB')
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='pending')
    yookassa_payment_id = models.CharField('ID платежа в ЮKassa', max_length=100, blank=True)
    confirmation_url = models.URLField('Ссылка на оплату', blank=True)
    created_at = models.DateTimeField('Создан', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлён', auto_now=True)

    class Meta:
        verbose_name = 'Платёж'
        verbose_name_plural = 'Платежи'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} — {self.plan} — {self.status}'
