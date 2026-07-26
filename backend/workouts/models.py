import uuid
from django.conf import settings
from django.db import models


class ExerciseTemplate(models.Model):
    MUSCLE_CHOICES = [
        ('legs_glutes', 'Ноги · Ягодицы'),
        ('back_hamstring', 'Спина · Задняя поверхность'),
        ('chest_triceps', 'Грудь · Трицепс'),
        ('back_biceps', 'Спина · Бицепс'),
        ('core', 'Кор · Стабилизация'),
        ('fullbody_cardio', 'Full body · Кардио'),
        ('cardio_endurance', 'Кардио · Выносливость'),
    ]

    slug = models.SlugField(
        'Код (латиницей)',
        unique=True,
        help_text='Латиницей, без пробелов. Например: squat-barbell',
    )
    name = models.CharField('Название', max_length=200)
    description = models.TextField('Описание')
    # MUSCLE_CHOICES не подключены к полю: в БД лежат подписи («Грудь · Трицепс»),
    # а не ключи. Переход на choices требует миграции данных и правок на фронте.
    muscle = models.CharField('Группа мышц', max_length=100)
    video_url = models.URLField('Ссылка на видео', blank=True)
    kinescope_id = models.CharField(
        'Kinescope ID',
        max_length=64,
        blank=True,
        help_text='Заполняется автоматически при загрузке видео. Можно вписать ID готового ролика вручную.',
    )

    class Meta:
        verbose_name = 'Упражнение'
        verbose_name_plural = 'Упражнения'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def video_embed(self):
        """Ссылка для встраивания плеера Kinescope; пусто, если видео не загружено."""
        if self.kinescope_id:
            return f'https://kinescope.io/embed/{self.kinescope_id}'
        return ''


class WorkoutProgram(models.Model):
    MODE_CHOICES = [('gym', 'Зал'), ('home', 'Дома')]
    INTENSITY_CHOICES = [
        ('easy', 'Лёгкая'),
        ('medium', 'Средняя'),
        ('high', 'Высокая'),
        ('intense', 'Интенсивно'),
        ('power', 'Сила'),
        ('cardio', 'Кардио'),
        ('tone', 'Тонус'),
        ('pulse', 'Пульс'),
    ]

    id = models.CharField(
        'Код программы',
        max_length=50,
        primary_key=True,
        help_text='Латиницей, без пробелов. Например: gym-fullbody. После создания не меняется.',
    )
    title = models.CharField('Название', max_length=200)
    description = models.TextField('Описание')
    duration_minutes = models.PositiveIntegerField('Длительность, мин')
    calories = models.PositiveIntegerField('Калории, ккал')
    intensity = models.CharField('Интенсивность', max_length=20, choices=INTENSITY_CHOICES)
    mode = models.CharField('Где заниматься', max_length=10, choices=MODE_CHOICES)
    tone = models.CharField('Акцент', max_length=50, blank=True)
    tag = models.CharField('Метка', max_length=100, blank=True)
    is_featured = models.BooleanField('Рекомендуемая', default=False)
    category = models.CharField('Категория', max_length=50, blank=True)
    is_active = models.BooleanField('Показывать в каталоге', default=True)

    class Meta:
        verbose_name = 'Программа тренировок'
        verbose_name_plural = 'Программы тренировок'
        ordering = ['title']

    def __str__(self):
        return self.title

    @property
    def duration_display(self):
        return f'{self.duration_minutes} мин'

    @property
    def calories_display(self):
        return f'{self.calories} ккал'

    @property
    def intensity_display(self):
        mapping = {
            'easy': 'Лёгкая', 'medium': 'Средняя', 'high': 'Высокая',
            'intense': 'Интенсивно', 'power': 'Сила', 'cardio': 'Кардио',
            'tone': 'Тонус', 'pulse': 'Пульс',
        }
        return mapping.get(self.intensity, self.intensity)


class WorkoutExercise(models.Model):
    workout = models.ForeignKey(WorkoutProgram, on_delete=models.CASCADE, related_name='exercises', verbose_name='Программа')
    template = models.ForeignKey(ExerciseTemplate, on_delete=models.CASCADE, verbose_name='Упражнение')
    position = models.PositiveSmallIntegerField('Порядок')
    sets = models.PositiveSmallIntegerField('Подходы')
    reps = models.PositiveSmallIntegerField('Повторения')
    weight = models.CharField('Вес', max_length=50, blank=True, default='—')
    rest_seconds = models.PositiveSmallIntegerField('Отдых, сек', default=60)

    class Meta:
        verbose_name = 'Упражнение в программе'
        verbose_name_plural = 'Упражнения в программах'
        ordering = ['position']

    def __str__(self):
        return f'{self.workout} — {self.template} (pos {self.position})'

    @property
    def rest_display(self):
        return f'{self.rest_seconds} сек'


class WorkoutSession(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'В процессе'),
        ('completed', 'Завершена'),
        ('abandoned', 'Брошена'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions', verbose_name='Пользователь')
    workout = models.ForeignKey(WorkoutProgram, on_delete=models.SET_NULL, null=True, verbose_name='Программа')
    started_at = models.DateTimeField('Начало')
    ended_at = models.DateTimeField('Окончание', null=True, blank=True)
    elapsed_seconds = models.PositiveIntegerField('Длительность, сек', default=0)
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='in_progress')

    class Meta:
        verbose_name = 'Сессия тренировки'
        verbose_name_plural = 'Сессии тренировок'
        ordering = ['-started_at']

    def __str__(self):
        return f'{self.user} — {self.workout} — {self.status}'


class ExerciseLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name='exercise_logs', verbose_name='Сессия')
    template = models.ForeignKey(ExerciseTemplate, on_delete=models.SET_NULL, null=True, verbose_name='Упражнение')
    original_exercise = models.ForeignKey(WorkoutExercise, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Исходное упражнение')
    was_swapped = models.BooleanField('Заменено', default=False)
    was_skipped = models.BooleanField('Пропущено', default=False)
    sets = models.PositiveSmallIntegerField('Подходы')
    reps = models.PositiveSmallIntegerField('Повторения')
    weight = models.CharField('Вес', max_length=50, blank=True, default='—')

    class Meta:
        verbose_name = 'Лог упражнения'
        verbose_name_plural = 'Логи упражнений'
