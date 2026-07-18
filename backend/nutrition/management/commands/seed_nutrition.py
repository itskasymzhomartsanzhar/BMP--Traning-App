from django.core.management.base import BaseCommand
from nutrition.models import Recipe

RECIPES = [
    {
        'id': 'r1', 'title': 'Омлет с индейкой', 'calories': 410,
        'protein': 36, 'fats': 18, 'carbs': 22, 'prep_minutes': 15,
        'ingredients': ['3 яйца', '80 г индейки', '30 г шпината', '1 ч.л. оливкового масла', 'Соль, перец'],
        'steps': ['Взбейте яйца с солью.', 'Обжарьте индейку 3 мин.', 'Добавьте шпинат и яйца, готовьте 4 мин под крышкой.'],
    },
    {
        'id': 'r2', 'title': 'Поке с тунцом', 'calories': 530,
        'protein': 42, 'fats': 14, 'carbs': 56, 'prep_minutes': 20,
        'ingredients': ['120 г тунца', '80 г риса', '50 г огурца', '30 г авокадо', 'Соевый соус, кунжут'],
        'steps': ['Сварите рис.', 'Нарежьте овощи.', 'Соберите боул: рис, тунец, овощи, соус.'],
    },
    {
        'id': 'r3', 'title': 'Греческий йогурт + ягоды', 'calories': 260,
        'protein': 25, 'fats': 6, 'carbs': 27, 'prep_minutes': 5,
        'ingredients': ['200 г греческого йогурта', '80 г ягод', '15 г мёда', '20 г гранолы'],
        'steps': ['Выложите йогурт в миску.', 'Добавьте ягоды и гранолу.', 'Полейте мёдом.'],
    },
]


class Command(BaseCommand):
    help = 'Seed recipes'

    def handle(self, *args, **options):
        for r in RECIPES:
            obj, created = Recipe.objects.update_or_create(id=r['id'], defaults=r)
            self.stdout.write(f"  {'Created' if created else 'Updated'} recipe: {obj.title}")
        self.stdout.write(self.style.SUCCESS('Recipes seeded.'))
