"""Загрузка видео упражнений на Kinescope.

Файл уходит напрямую в uploader.kinescope.io, в БД хранится только ID видео.
Kinescope обрабатывает ролик асинхронно: сразу после загрузки embed может
отдавать «видео обрабатывается» — это нормально, через пару минут заработает.
"""
import requests
from django.conf import settings

UPLOAD_URL = 'https://uploader.kinescope.io/v2/video'


class KinescopeError(Exception):
    """Понятная человеку ошибка загрузки — показывается в админке."""


def upload_video(file_obj, title):
    """Загружает файл на Kinescope и возвращает ID видео."""
    token = settings.KINESCOPE_API_TOKEN
    if not token:
        raise KinescopeError(
            'Не задан KINESCOPE_API_TOKEN. Добавьте токен API Kinescope в .env и перезапустите сервер.'
        )

    headers = {
        'Authorization': f'Bearer {token}',
        'X-Video-Title': title.encode('utf-8'),
        'X-File-Name': (getattr(file_obj, 'name', '') or 'exercise.mp4').encode('utf-8'),
    }
    if settings.KINESCOPE_PARENT_ID:
        headers['X-Parent-ID'] = settings.KINESCOPE_PARENT_ID

    try:
        response = requests.post(UPLOAD_URL, headers=headers, data=file_obj, timeout=600)
    except requests.RequestException as exc:
        raise KinescopeError(f'Kinescope недоступен: {exc}') from exc

    if response.status_code not in (200, 201):
        detail = ''
        try:
            detail = response.json().get('message', '')
        except ValueError:
            pass
        raise KinescopeError(
            f'Kinescope отклонил загрузку ({response.status_code}). {detail}'.strip()
        )

    try:
        video_id = response.json()['data']['id']
    except (ValueError, KeyError) as exc:
        raise KinescopeError('Kinescope вернул неожиданный ответ — видео не сохранено.') from exc

    return video_id
