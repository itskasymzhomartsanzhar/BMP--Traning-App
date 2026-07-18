from django.core.management.base import BaseCommand
from workouts.models import ExerciseTemplate, WorkoutProgram, WorkoutExercise

DEMO_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

TEMPLATES = [
    {'slug': 'squat', 'name': 'Приседания со штангой', 'description': 'Держите спину ровно, колени направлены по линии носков. Опускайтесь до параллели бедра с полом.', 'muscle': 'Ноги · Ягодицы', 'video_url': DEMO_VIDEO},
    {'slug': 'deadlift', 'name': 'Становая тяга', 'description': 'Корпус стабилен, штанга движется близко к телу. В верхней точке — полное разгибание.', 'muscle': 'Спина · Задняя поверхность', 'video_url': DEMO_VIDEO},
    {'slug': 'bench', 'name': 'Жим лёжа', 'description': 'Лопатки сведены, локти под углом 45°. Контролируйте опускание и мощный подъём.', 'muscle': 'Грудь · Трицепс', 'video_url': DEMO_VIDEO},
    {'slug': 'row', 'name': 'Тяга в наклоне', 'description': 'Корпус параллелен полу, тяните локтями назад. Сводите лопатки в верхней точке.', 'muscle': 'Спина · Бицепс', 'video_url': DEMO_VIDEO},
    {'slug': 'pullup', 'name': 'Подтягивания', 'description': 'Полная амплитуда: подбородок над перекладиной, контролируемое опускание.', 'muscle': 'Спина · Бицепс', 'video_url': DEMO_VIDEO},
    {'slug': 'plank', 'name': 'Планка', 'description': 'Тело — прямая линия от головы до пят. Напрягите пресс и ягодицы.', 'muscle': 'Кор · Стабилизация', 'video_url': DEMO_VIDEO},
    {'slug': 'burpee', 'name': 'Бёрпи', 'description': 'Прыжок, отжимание, прыжок. Держите темп и дыхание ровным.', 'muscle': 'Full body · Кардио', 'video_url': DEMO_VIDEO},
    {'slug': 'lunge', 'name': 'Выпады с гантелями', 'description': 'Шаг вперёд, колено задней ноги почти касается пола. Корпус вертикально.', 'muscle': 'Ноги · Ягодицы', 'video_url': DEMO_VIDEO},
    {'slug': 'pushup', 'name': 'Отжимания', 'description': 'Корпус жёсткий, локти под углом 45°. Грудь почти касается пола.', 'muscle': 'Грудь · Трицепс', 'video_url': DEMO_VIDEO},
    {'slug': 'jump', 'name': 'Прыжки на скакалке', 'description': 'Лёгкие приземления на носки. Руки у корпуса, темп стабильный.', 'muscle': 'Кардио · Выносливость', 'video_url': DEMO_VIDEO},
]

PROGRAMS = [
    {
        'id': 'gym-fat-burn-power', 'title': 'Fat Burn Power',
        'description': 'Силовой микс для жиросжигания, рельефа и выносливости. Интервальные блоки с базовыми движениями.',
        'duration_minutes': 35, 'calories': 350, 'intensity': 'high', 'mode': 'gym',
        'tone': 'tone-rose', 'tag': 'Зал · Интенсив', 'is_featured': True,
        'exercises': [
            ('burpee', 4, 12, 'Собственный вес', 60),
            ('squat', 4, 15, '50 кг', 75),
            ('bench', 3, 12, '40 кг', 90),
            ('row', 3, 12, '35 кг', 75),
            ('plank', 3, 45, '—', 45),
        ],
    },
    {
        'id': 'gym-fullbody', 'title': 'Full Body Burn',
        'description': 'Высокоинтенсивная тренировка на все тело. Идеальна для жиросжигания и тонуса.',
        'duration_minutes': 25, 'calories': 280, 'intensity': 'medium', 'mode': 'gym',
        'tone': 'tone-blue-card', 'tag': 'Зал · Средний',
        'exercises': [
            ('squat', 4, 12, '60 кг', 90),
            ('bench', 3, 10, '50 кг', 90),
            ('row', 3, 12, '40 кг', 75),
            ('lunge', 3, 10, '16 кг', 60),
            ('plank', 3, 40, '—', 45),
        ],
    },
    {
        'id': 'gym-power', 'title': 'Power Lift Routine',
        'description': 'Фокус на базовых движениях и силе. Тяжёлые подходы с полным восстановлением.',
        'duration_minutes': 40, 'calories': 320, 'intensity': 'power', 'mode': 'gym',
        'tone': 'tone-green-card', 'tag': 'Зал · Продвинутый',
        'exercises': [
            ('squat', 5, 5, '80 кг', 180),
            ('deadlift', 4, 5, '100 кг', 180),
            ('bench', 4, 6, '70 кг', 150),
            ('row', 3, 8, '50 кг', 120),
        ],
    },
    {
        'id': 'gym-hiit', 'title': 'HIIT Condition',
        'description': 'Интервальные блоки для выносливости. Короткий отдых, высокий пульс.',
        'duration_minutes': 30, 'calories': 380, 'intensity': 'intense', 'mode': 'gym',
        'tone': 'tone-charcoal-card', 'tag': 'Зал · Быстрый темп',
        'exercises': [
            ('burpee', 5, 15, '—', 45),
            ('jump', 4, 60, '—', 30),
            ('pushup', 4, 15, '—', 45),
            ('lunge', 3, 12, '—', 45),
            ('plank', 3, 50, '—', 30),
        ],
    },
    {
        'id': 'home-energy-flow', 'title': 'Home Energy Flow',
        'description': 'Комплекс без оборудования для рельефа и тонуса. Подходит для утренней активации.',
        'duration_minutes': 28, 'calories': 260, 'intensity': 'medium', 'mode': 'home',
        'tone': 'tone-sand', 'tag': 'Дома · Средний', 'is_featured': True,
        'exercises': [
            ('pushup', 4, 12, '—', 60),
            ('squat', 4, 20, '—', 45),
            ('plank', 3, 45, '—', 40),
            ('lunge', 3, 12, '—', 45),
            ('burpee', 3, 10, '—', 60),
        ],
    },
    {
        'id': 'home-morning', 'title': 'Morning Wake Up',
        'description': 'Лёгкий старт дня для активации мышц и пробуждения тела.',
        'duration_minutes': 18, 'calories': 150, 'intensity': 'easy', 'mode': 'home',
        'tone': 'tone-blue-card', 'tag': 'Дома · Утро',
        'exercises': [
            ('plank', 3, 30, '—', 30),
            ('squat', 3, 15, '—', 40),
            ('pushup', 3, 10, '—', 45),
            ('lunge', 2, 10, '—', 40),
        ],
    },
    {
        'id': 'home-core', 'title': 'Core & Balance',
        'description': 'Пресс, стабилизация и осанка. Укрепление центра тела.',
        'duration_minutes': 24, 'calories': 180, 'intensity': 'tone', 'mode': 'home',
        'tone': 'tone-green-card', 'tag': 'Дома · Средний',
        'exercises': [
            ('plank', 4, 45, '—', 40),
            ('lunge', 3, 12, '—', 45),
            ('pushup', 3, 12, '—', 50),
            ('squat', 3, 15, '—', 45),
        ],
    },
    {
        'id': 'home-cardio', 'title': 'Cardio Blast',
        'description': 'Пульсовая тренировка в домашних условиях. Без оборудования.',
        'duration_minutes': 22, 'calories': 240, 'intensity': 'high', 'mode': 'home',
        'tone': 'tone-charcoal-card', 'tag': 'Дома · Энергия',
        'exercises': [
            ('burpee', 4, 12, '—', 40),
            ('jump', 4, 45, '—', 30),
            ('squat', 3, 20, '—', 35),
            ('pushup', 3, 15, '—', 40),
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed exercise templates and workout programs'

    def handle(self, *args, **options):
        template_map = {}
        for t in TEMPLATES:
            obj, created = ExerciseTemplate.objects.update_or_create(
                slug=t['slug'],
                defaults={k: v for k, v in t.items() if k != 'slug'},
            )
            template_map[t['slug']] = obj
            self.stdout.write(f"  {'Created' if created else 'Updated'} exercise: {obj.name}")

        for p in PROGRAMS:
            exercises = p.pop('exercises')
            obj, created = WorkoutProgram.objects.update_or_create(
                id=p['id'],
                defaults=p,
            )
            self.stdout.write(f"  {'Created' if created else 'Updated'} program: {obj.title}")

            WorkoutExercise.objects.filter(workout=obj).delete()
            for i, (slug, sets, reps, weight, rest) in enumerate(exercises):
                WorkoutExercise.objects.create(
                    workout=obj,
                    template=template_map[slug],
                    position=i + 1,
                    sets=sets, reps=reps, weight=weight, rest_seconds=rest,
                )

        self.stdout.write(self.style.SUCCESS('Workouts seeded successfully.'))
