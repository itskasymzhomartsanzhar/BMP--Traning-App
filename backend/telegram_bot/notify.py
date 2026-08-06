"""Отправка сообщений пользователям через Telegram Bot API.

Синхронные функции: зовутся и из Django (management-команда), и из
процесса бота (через asyncio.to_thread). Пуш уходит только тем, у кого
подключён Telegram (tg_id) и включён тумблер push_notifications.
"""

import logging
from datetime import date

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

SEND_URL = 'https://api.telegram.org/bot{token}/sendMessage'

DAY_KEYS = {0: 'mon', 1: 'tue', 2: 'wed', 3: 'thu', 4: 'fri', 5: 'sat', 6: 'sun'}

REMINDER_TEXT = {
    'ru': '💪 Сегодня по плану тренировка!\nОткрой TRES и начни — тело скажет спасибо.',
    'en': "💪 It's workout day!\nOpen TRES and get started — your body will thank you.",
}


def send_telegram_message(tg_id, text):
    """Одно сообщение одному пользователю; False при любой ошибке."""
    token = settings.TELEGRAM_BOT_TOKEN
    if not token or not tg_id:
        return False
    try:
        response = requests.post(
            SEND_URL.format(token=token),
            json={'chat_id': tg_id, 'text': text},
            timeout=10,
        )
        if not response.ok:
            logger.warning('sendMessage %s: %s', tg_id, response.text[:200])
        return response.ok
    except requests.RequestException as exc:
        logger.warning('sendMessage %s failed: %s', tg_id, exc)
        return False


def send_workout_reminders():
    """Напоминание о тренировке всем, у кого сегодня тренировочный день.

    Возвращает количество доставленных сообщений.
    """
    from users.models import User

    day_key = DAY_KEYS[date.today().weekday()]
    users = (
        User.objects
        .filter(push_notifications=True, tg_id__isnull=False)
        .exclude(tg_id=0)
    )

    sent = 0
    for user in users:
        if day_key not in (user.training_days or []):
            continue
        text = REMINDER_TEXT['en' if user.language == 'en' else 'ru']
        if send_telegram_message(user.tg_id, text):
            sent += 1
    return sent
