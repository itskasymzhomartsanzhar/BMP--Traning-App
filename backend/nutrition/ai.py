"""Распознавание еды ИИ-моделью: фото, текст и голосовые.

Провайдер и модель задаются переменными окружения — код вызова один:
  NUTRITION_AI_PROVIDER — google (по умолчанию) или anthropic
  NUTRITION_AI_MODEL    — модель; пусто = дефолт провайдера
                          (google → gemini-2.5-flash, anthropic → claude-opus-4-8)
  GEMINI_API_KEY        — ключ Google AI Studio
  ANTHROPIC_API_KEY     — ключ Anthropic (для провайдера anthropic)
  STT_MODEL / OPENAI_API_KEY — распознавание речи Whisper (только с anthropic:
                          Gemini понимает аудио сам, отдельный STT не нужен)

Все функции бросают AIError с человекочитаемым detail — вью отдаёт его в тост.
"""

import base64
import json

import requests
from decouple import config

NUTRITION_AI_PROVIDER = config('NUTRITION_AI_PROVIDER', default='google')
NUTRITION_AI_MODEL = config('NUTRITION_AI_MODEL', default='')
GEMINI_API_KEY = config('GEMINI_API_KEY', default='')
ANTHROPIC_API_KEY = config('ANTHROPIC_API_KEY', default='')
STT_MODEL = config('STT_MODEL', default='whisper-1')
OPENAI_API_KEY = config('OPENAI_API_KEY', default='')

DEFAULT_MODELS = {'google': 'gemini-2.5-flash', 'anthropic': 'claude-opus-4-8'}

GOOGLE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'


def _model():
    return NUTRITION_AI_MODEL or DEFAULT_MODELS.get(NUTRITION_AI_PROVIDER, 'gemini-2.5-flash')


PHOTO_PROMPT = (
    'Определи по фото, какая еда на нём, оцени вес каждой порции и посчитай её КБЖУ. '
    'Если на фото несколько блюд или продуктов — верни каждое отдельной позицией. '
    'Оценивай порции реалистично, по видимому объёму и посуде. Названия пиши на русском, коротко. '
    'Если на фото нет еды, верни пустой список items и объясни это в comment, иначе comment оставь пустым.'
)

TEXT_PROMPT = (
    'Пользователь описал, что он съел. Выдели каждое блюдо или продукт отдельной позицией, '
    'оцени вес порции (если объём не назван — возьми типичную порцию) и посчитай КБЖУ порции. '
    'Названия пиши на русском, коротко. Если в тексте нет еды, верни пустой список items '
    'и объясни это в comment, иначе comment оставь пустым.\n\nОписание пользователя:\n'
)

VOICE_PROMPT = (
    'В аудио пользователь рассказывает, что он съел. Сначала дословно расшифруй речь в поле transcript. '
    'Затем выдели каждое блюдо или продукт отдельной позицией, оцени вес порции '
    '(если объём не назван — возьми типичную порцию) и посчитай КБЖУ порции. '
    'Названия пиши на русском, коротко. Если еды в записи нет, верни пустой список items '
    'и объясни это в comment, иначе comment оставь пустым.'
)


class AIError(Exception):
    def __init__(self, detail, status=502):
        super().__init__(detail)
        self.detail = detail
        self.status = status


def _clean_items(data):
    """Общая нормализация ответа модели: числа, границы, обрезка строк."""
    items = []
    for item in data.get('items', []):
        try:
            items.append({
                'name': str(item['name'])[:200],
                'grams': max(0.0, round(float(item['grams']), 1)),
                'calories': max(0.0, round(float(item['calories']), 1)),
                'protein': max(0.0, round(float(item['protein']), 1)),
                'fats': max(0.0, round(float(item['fats']), 1)),
                'carbs': max(0.0, round(float(item['carbs']), 1)),
            })
        except (KeyError, TypeError, ValueError):
            continue
    return {'items': items, 'comment': str(data.get('comment', '')).strip()}


# --- Google Gemini -----------------------------------------------------------

_G_ITEM_SCHEMA = {
    'type': 'OBJECT',
    'properties': {
        'name': {'type': 'STRING', 'description': 'Название блюда или продукта'},
        'grams': {'type': 'NUMBER', 'description': 'Оценка веса порции в граммах'},
        'calories': {'type': 'NUMBER', 'description': 'Калорийность порции, ккал'},
        'protein': {'type': 'NUMBER', 'description': 'Белки порции, г'},
        'fats': {'type': 'NUMBER', 'description': 'Жиры порции, г'},
        'carbs': {'type': 'NUMBER', 'description': 'Углеводы порции, г'},
    },
    'required': ['name', 'grams', 'calories', 'protein', 'fats', 'carbs'],
    'propertyOrdering': ['name', 'grams', 'calories', 'protein', 'fats', 'carbs'],
}

GOOGLE_FOOD_SCHEMA = {
    'type': 'OBJECT',
    'properties': {
        'items': {'type': 'ARRAY', 'items': _G_ITEM_SCHEMA},
        'comment': {'type': 'STRING'},
    },
    'required': ['items', 'comment'],
    'propertyOrdering': ['items', 'comment'],
}

GOOGLE_VOICE_SCHEMA = {
    'type': 'OBJECT',
    'properties': {
        'transcript': {'type': 'STRING', 'description': 'Дословная расшифровка речи'},
        'items': {'type': 'ARRAY', 'items': _G_ITEM_SCHEMA},
        'comment': {'type': 'STRING'},
    },
    'required': ['transcript', 'items', 'comment'],
    'propertyOrdering': ['transcript', 'items', 'comment'],
}


def _google_generate(parts, schema):
    if not GEMINI_API_KEY:
        raise AIError('Распознавание не настроено: нет ключа Gemini (GEMINI_API_KEY).', status=503)
    try:
        response = requests.post(
            GOOGLE_API_URL.format(model=_model()),
            headers={'x-goog-api-key': GEMINI_API_KEY},
            json={
                'contents': [{'parts': parts}],
                'generationConfig': {
                    'responseMimeType': 'application/json',
                    'responseSchema': schema,
                },
            },
            timeout=(10, 90),
        )
    except requests.RequestException:
        raise AIError('Нет связи с сервисом распознавания. Попробуйте ещё раз.')

    if response.status_code != 200:
        try:
            message = response.json().get('error', {}).get('message', '')
        except ValueError:
            message = ''
        if 'location' in message.lower():
            # Google режет запросы из неподдерживаемых регионов по IP сервера.
            raise AIError('Gemini недоступен из региона сервера. Нужен хостинг или прокси в поддерживаемом регионе.')
        raise AIError(f'Сервис распознавания недоступен ({response.status_code}). Попробуйте ещё раз.')

    try:
        answer_parts = response.json()['candidates'][0]['content']['parts']
        text = ''.join(part.get('text', '') for part in answer_parts)
        return json.loads(text)
    except (KeyError, IndexError, TypeError, ValueError):
        raise AIError('Модель вернула некорректный ответ. Попробуйте ещё раз.')


def _inline_data(raw_bytes, mime_type):
    return {'inlineData': {'mimeType': mime_type, 'data': base64.standard_b64encode(raw_bytes).decode()}}


# --- Anthropic Claude --------------------------------------------------------

FOOD_SCHEMA = {
    'type': 'object',
    'properties': {
        'items': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'name': {'type': 'string', 'description': 'Название блюда или продукта'},
                    'grams': {'type': 'number', 'description': 'Оценка веса порции в граммах'},
                    'calories': {'type': 'number', 'description': 'Калорийность порции, ккал'},
                    'protein': {'type': 'number', 'description': 'Белки порции, г'},
                    'fats': {'type': 'number', 'description': 'Жиры порции, г'},
                    'carbs': {'type': 'number', 'description': 'Углеводы порции, г'},
                },
                'required': ['name', 'grams', 'calories', 'protein', 'fats', 'carbs'],
                'additionalProperties': False,
            },
        },
        'comment': {
            'type': 'string',
            'description': 'Одно короткое замечание для пользователя, либо пустая строка',
        },
    },
    'required': ['items', 'comment'],
    'additionalProperties': False,
}


def _anthropic_generate(content):
    if not ANTHROPIC_API_KEY:
        raise AIError('Распознавание не настроено: нет ключа ИИ (ANTHROPIC_API_KEY).', status=503)
    import anthropic

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    try:
        response = client.messages.create(
            model=_model(),
            max_tokens=2000,
            output_config={'format': {'type': 'json_schema', 'schema': FOOD_SCHEMA}},
            messages=[{'role': 'user', 'content': content}],
        )
    except anthropic.APIStatusError as exc:
        raise AIError(f'Сервис распознавания недоступен ({exc.status_code}). Попробуйте ещё раз.')
    except anthropic.APIConnectionError:
        raise AIError('Нет связи с сервисом распознавания. Попробуйте ещё раз.')

    if response.stop_reason == 'refusal':
        raise AIError('Не получилось распознать. Попробуйте ещё раз.', status=422)

    text = next((block.text for block in response.content if block.type == 'text'), '')
    try:
        return json.loads(text)
    except ValueError:
        raise AIError('Модель вернула некорректный ответ. Попробуйте ещё раз.')


def transcribe_audio(audio_bytes, filename, media_type):
    """Голос → текст через OpenAI Whisper (нужен только с провайдером anthropic)."""
    if not OPENAI_API_KEY:
        raise AIError('Распознавание голоса не настроено: нет ключа (OPENAI_API_KEY).', status=503)
    try:
        response = requests.post(
            'https://api.openai.com/v1/audio/transcriptions',
            headers={'Authorization': f'Bearer {OPENAI_API_KEY}'},
            files={'file': (filename, audio_bytes, media_type)},
            data={'model': STT_MODEL},
            timeout=(10, 60),
        )
    except requests.RequestException:
        raise AIError('Нет связи с сервисом распознавания речи. Попробуйте ещё раз.')
    if response.status_code != 200:
        raise AIError(f'Сервис распознавания речи недоступен ({response.status_code}).')
    text = response.json().get('text', '').strip()
    if not text:
        raise AIError('Не удалось разобрать запись. Скажите ещё раз, чётче.', status=422)
    return text


# --- Публичный интерфейс (провайдер решается здесь) --------------------------

def analyze_food_photo(image_bytes, media_type):
    """Фото еды → {items: [{name, grams, calories, protein, fats, carbs}], comment}."""
    if NUTRITION_AI_PROVIDER == 'google':
        data = _google_generate([_inline_data(image_bytes, media_type), {'text': PHOTO_PROMPT}], GOOGLE_FOOD_SCHEMA)
    else:
        data = _anthropic_generate([
            {
                'type': 'image',
                'source': {
                    'type': 'base64',
                    'media_type': media_type,
                    'data': base64.standard_b64encode(image_bytes).decode(),
                },
            },
            {'type': 'text', 'text': PHOTO_PROMPT},
        ])
    return _clean_items(data)


def analyze_food_text(text):
    """Описание еды словами → те же позиции с КБЖУ."""
    prompt = TEXT_PROMPT + text.strip()
    if NUTRITION_AI_PROVIDER == 'google':
        data = _google_generate([{'text': prompt}], GOOGLE_FOOD_SCHEMA)
    else:
        data = _anthropic_generate([{'type': 'text', 'text': prompt}])
    return _clean_items(data)


def analyze_food_audio(audio_bytes, filename, media_type):
    """Голосовое → {transcript, items, comment}.

    Gemini понимает аудио напрямую — расшифровка и КБЖУ одним запросом;
    с провайдером anthropic аудио сначала уходит в Whisper.
    """
    mime = (media_type or 'audio/webm').split(';')[0].strip()
    if NUTRITION_AI_PROVIDER == 'google':
        data = _google_generate([_inline_data(audio_bytes, mime), {'text': VOICE_PROMPT}], GOOGLE_VOICE_SCHEMA)
        result = _clean_items(data)
        result['transcript'] = str(data.get('transcript', '')).strip()
        if not result['transcript'] and not result['items']:
            raise AIError('Не удалось разобрать запись. Скажите ещё раз, чётче.', status=422)
        return result

    transcript = transcribe_audio(audio_bytes, filename, mime)
    result = analyze_food_text(transcript)
    result['transcript'] = transcript
    return result
