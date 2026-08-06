"""Точка входа Telegram-бота: python main.py (запускать из папки backend).

Токен берётся из TELEGRAM_BOT_TOKEN (.env), адрес Mini App — из
TG_WEBAPP_URL. Бот работает через long polling — вебхуки не нужны.

Помимо ответов на команды бот раз в сутки (в TG_REMINDER_HOUR по времени
сервера) рассылает напоминания о тренировке пользователям с подключённым
Telegram и включёнными пуш-уведомлениями.
"""

import asyncio
import logging
import os
from datetime import datetime
from pathlib import Path

# Django нужен процессу бота ради ORM (выборка получателей рассылки).
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django  # noqa: E402

django.setup()

from aiogram import Bot, Dispatcher  # noqa: E402
from aiogram.client.default import DefaultBotProperties  # noqa: E402
from aiogram.enums import ParseMode  # noqa: E402
from decouple import config  # noqa: E402

from telegram_bot.bot import router  # noqa: E402
from telegram_bot.notify import send_workout_reminders  # noqa: E402

REMINDER_HOUR = config('TG_REMINDER_HOUR', default=9, cast=int)
# Файл-маркер защищает от повторной рассылки при перезапуске процесса.
MARKER_FILE = Path(__file__).resolve().parent / '.last_reminder_date'


async def reminder_loop():
    while True:
        now = datetime.now()
        today = now.date().isoformat()
        already_sent = MARKER_FILE.exists() and MARKER_FILE.read_text().strip() == today
        if now.hour >= REMINDER_HOUR and not already_sent:
            try:
                sent = await asyncio.to_thread(send_workout_reminders)
                logging.info('Напоминания о тренировке: отправлено %s', sent)
            except Exception:
                logging.exception('Рассылка напоминаний упала')
            MARKER_FILE.write_text(today)
        await asyncio.sleep(600)


async def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(name)s: %(message)s',
    )

    bot = Bot(
        token=config('TELEGRAM_BOT_TOKEN'),
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()
    dp.include_router(router)

    asyncio.create_task(reminder_loop())

    # На случай перезапуска после простоя не разгребаем старые апдейты.
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == '__main__':
    asyncio.run(main())
