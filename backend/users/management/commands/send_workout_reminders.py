from django.core.management.base import BaseCommand

from telegram_bot.notify import send_workout_reminders


class Command(BaseCommand):
    help = 'Отправить напоминания о тренировке пользователям с подключённым Telegram'

    def handle(self, *args, **options):
        sent = send_workout_reminders()
        self.stdout.write(self.style.SUCCESS(f'Отправлено напоминаний: {sent}'))
