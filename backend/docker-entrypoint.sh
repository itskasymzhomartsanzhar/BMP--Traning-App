#!/bin/sh
set -e

echo "Применяем миграции…"
python manage.py migrate --noinput

echo "Собираем статику…"
python manage.py collectstatic --noinput

# Первый запуск: каталог пуст — переносим контент (программы, рецепты, статьи).
python - << 'PY'
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from django.core.management import call_command
from workouts.models import WorkoutProgram

if not WorkoutProgram.objects.exists():
    print('Каталог пуст — загружаем fixtures/catalog.json')
    call_command('loaddata', 'fixtures/catalog.json')
else:
    print('Каталог уже наполнен — пропускаем загрузку.')
PY

# Опционально: суперпользователь из переменных окружения (только если ещё нет).
if [ -n "$DJANGO_SUPERUSER_TG_ID" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    python manage.py createsuperuser --noinput --tg_id "$DJANGO_SUPERUSER_TG_ID" 2>/dev/null \
        && echo "Суперпользователь создан." \
        || echo "Суперпользователь уже существует — пропускаем."
fi

echo "Запускаем gunicorn…"
exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 60 \
    --access-logfile - \
    --error-logfile -
