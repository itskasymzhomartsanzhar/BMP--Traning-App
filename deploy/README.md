# Деплой TRES на tresfit.ru

## Что нужно на сервере

- Docker + docker compose plugin
- DNS A-записи `tresfit.ru` и `www.tresfit.ru` → IP сервера
- Открытые порты 80 и 443

## Запуск

```bash
git clone <репозиторий> tres && cd tres
cp .env.example .env
nano .env        # SECRET_KEY, POSTGRES_PASSWORD, TELEGRAM_BOT_TOKEN, пароль админа
docker compose up -d --build
```

Всё. При первом запуске автоматически:

1. Поднимается Postgres, применяются миграции.
2. Загружается каталог (программы, упражнения, рецепты, статьи).
3. Создаётся администратор (`DJANGO_SUPERUSER_TG_ID` / `DJANGO_SUPERUSER_PASSWORD` из .env) — вход в `https://tresfit.ru/admin/`.
4. nginx стартует с временным сертификатом, certbot выпускает настоящий
   Let's Encrypt (и дальше продлевает сам); nginx подхватывает его в течение
   30 секунд. Если DNS ещё не указывает на сервер — certbot повторяет попытку
   каждый час.

## Telegram

- **Мини-апп**: в BotFather задать Web App URL → `https://tresfit.ru`.
- **Кнопка «Войти через Telegram» на сайте** (новый Login SDK, OIDC):
  в BotFather открыть My Bots → Bot Settings → **Web Login**, добавить
  `https://tresfit.ru` в Allowed URLs и взять оттуда Client ID.
  Заполнить `TELEGRAM_LOGIN_CLIENT_ID` (бэкенд) и `VITE_TG_LOGIN_CLIENT_ID`
  в .env **до** сборки (кнопка вшивается в сборку фронтенда).

## Полезное

```bash
docker compose logs -f backend        # логи Django
docker compose logs certbot           # статус сертификата
docker compose exec backend python manage.py createsuperuser   # ещё один админ
docker compose up -d --build          # обновление после git pull
docker compose exec db pg_dump -U tres tres > backup.sql       # бэкап БД
```

Данные живут в docker-томах (`pgdata`, `media`, `certbot-etc`) и переживают
пересборку. `docker compose down` их не трогает; удаляет только `down -v`.
