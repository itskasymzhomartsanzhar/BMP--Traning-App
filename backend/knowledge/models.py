from django.db import models


class Article(models.Model):
    CATEGORY_CHOICES = [
        ('workout', 'Тренировки'),
        ('nutrition', 'Питание'),
        ('recovery', 'Восстановление'),
        ('motivation', 'Мотивация'),
    ]
    LEVEL_CHOICES = [
        ('base', 'База'),
        ('medium', 'Средний'),
        ('advanced', 'Продвинутый'),
    ]
    CATEGORY_DISPLAY = {
        'workout': 'Тренировки', 'nutrition': 'Питание',
        'recovery': 'Восстановление', 'motivation': 'Мотивация',
    }
    LEVEL_DISPLAY = {
        'base': 'База', 'medium': 'Средний', 'advanced': 'Продвинутый',
    }

    id = models.CharField(
        'Код статьи',
        max_length=50,
        primary_key=True,
        help_text='Латиницей, без пробелов. Например: protein-basics. После создания не меняется.',
    )
    category = models.CharField('Категория', max_length=20, choices=CATEGORY_CHOICES)
    title = models.CharField('Заголовок', max_length=300)
    read_time_minutes = models.PositiveSmallIntegerField('Время чтения, мин')
    level = models.CharField('Уровень', max_length=20, choices=LEVEL_CHOICES)
    body = models.TextField('Текст статьи')
    is_active = models.BooleanField('Опубликована', default=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Статья'
        verbose_name_plural = 'Статьи'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def category_display(self):
        return self.CATEGORY_DISPLAY.get(self.category, self.category)

    @property
    def level_display(self):
        return self.LEVEL_DISPLAY.get(self.level, self.level)

    @property
    def read_time_display(self):
        return f'{self.read_time_minutes} мин'
