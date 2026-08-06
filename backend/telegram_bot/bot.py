"""Хендлеры Telegram-бота TRES.

Пока один сценарий: /start — приветствие и кнопка, открывающая
приложение как Telegram Mini App (web_app работает только по HTTPS).
"""

from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo
from decouple import config

WEBAPP_URL = config('TG_WEBAPP_URL', default='https://tresfit.ru')

router = Router()


def webapp_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text='🏋️ Открыть TRES',
            web_app=WebAppInfo(url=WEBAPP_URL),
        ),
    ]])


@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    name = message.from_user.first_name if message.from_user else ''
    greeting = f'Привет, {name}!' if name else 'Привет!'
    await message.answer(
        f'{greeting}\n\n'
        '<b>TRES</b> — твоя фитнес-экосистема: тренировки, питание '
        'и аналитика прогресса в одном месте.\n\n'
        'Нажми кнопку ниже, чтобы открыть приложение 👇',
        reply_markup=webapp_keyboard(),
    )
