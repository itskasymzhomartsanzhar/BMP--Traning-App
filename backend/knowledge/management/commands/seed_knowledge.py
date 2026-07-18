from django.core.management.base import BaseCommand
from knowledge.models import Article

ARTICLES = [
    {
        'id': 'a1', 'category': 'nutrition', 'title': 'Как считать БЖУ без стресса',
        'read_time_minutes': 7, 'level': 'base',
        'body': 'Начните с одного приёма пищи в день. Используйте простые эталоны: ладонь — белок, кулак — углеводы, большой палец — жиры.\n\nЧерез неделю добавьте второй приём. Цель — понимать порции, а не идеальная точность.',
    },
    {
        'id': 'a2', 'category': 'workout', 'title': 'Прогрессия нагрузок: когда и как повышать вес',
        'read_time_minutes': 9, 'level': 'medium',
        'body': 'Повышайте вес, когда выполняете верхнюю границу повторений во всех подходах с хорошей техникой.\n\nШаг: +2.5 кг для верха тела, +5 кг для низа. Если техника ломается — останьтесь на текущем весе ещё 1–2 недели.',
    },
    {
        'id': 'a3', 'category': 'recovery', 'title': 'Сон и результаты: сколько нужно спать',
        'read_time_minutes': 6, 'level': 'base',
        'body': '7–9 часов — оптимальный диапазон для большинства. Недосып снижает восстановление и повышает тягу к сладкому.\n\nСтабильное время подъёма важнее «догоняющего» сна в выходные.',
    },
    {
        'id': 'a4', 'category': 'motivation', 'title': 'Как не сорваться на 3-й неделе программы',
        'read_time_minutes': 5, 'level': 'base',
        'body': 'На 3-й неделе мотивация падает — это нормально. Сократите план до минимума: 2 тренировки вместо 4, но не ноль.\n\nОтметьте маленькую победу: вес, замеры или просто факт «я пришёл».',
    },
    {
        'id': 'a5', 'category': 'nutrition', 'title': 'Рефид и читмил: в чем разница',
        'read_time_minutes': 8, 'level': 'medium',
        'body': 'Рефид — контролируемое повышение углеводов 1–2 дня для восстановления лептина.\n\nЧитмил — разовый «свободный» приём без строгого учёта. Рефид планируют, читмил — эмоциональная разгрузка.',
    },
]


class Command(BaseCommand):
    help = 'Seed knowledge articles'

    def handle(self, *args, **options):
        for a in ARTICLES:
            obj, created = Article.objects.update_or_create(id=a['id'], defaults=a)
            self.stdout.write(f"  {'Created' if created else 'Updated'} article: {obj.title}")
        self.stdout.write(self.style.SUCCESS('Articles seeded.'))
