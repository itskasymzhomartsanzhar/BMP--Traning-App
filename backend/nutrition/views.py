from datetime import date

import requests
from django.core.cache import cache
from django.db.models import Sum
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from . import ai
from .models import NutritionDay, FoodEntry
from .serializers import NutritionDaySerializer, FoodEntrySerializer

# Open Food Facts просит представляться — без User-Agent режет запросы.
OFF_HEADERS = {'User-Agent': 'TresFit/1.0 (tresfit.ru)'}
OFF_TIMEOUT = (5, 15)


def _parse_date(raw):
    try:
        return date.fromisoformat(str(raw))
    except ValueError:
        return None


def _day_payload(user, target_date):
    day, _ = NutritionDay.objects.get_or_create(user=user, date=target_date)
    entries = FoodEntry.objects.filter(user=user, date=target_date)
    eaten = entries.aggregate(
        calories=Sum('calories'), protein=Sum('protein'), fats=Sum('fats'), carbs=Sum('carbs'),
    )
    data = NutritionDaySerializer(day).data
    data['eaten'] = {key: round(value or 0, 1) for key, value in eaten.items()}
    data['entries'] = FoodEntrySerializer(entries, many=True).data
    return data


class NutritionDayView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        target_date = _parse_date(request.query_params.get('date', date.today()))
        if not target_date:
            return Response({'detail': 'Invalid date format, use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(_day_payload(request.user, target_date))

    def patch(self, request):
        target_date = _parse_date(request.query_params.get('date', date.today()))
        if not target_date:
            return Response({'detail': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        day, _ = NutritionDay.objects.get_or_create(user=request.user, date=target_date)
        allowed_fields = ['target_calories', 'target_protein', 'target_fats', 'target_carbs', 'target_water_liters']
        for field in allowed_fields:
            if field in request.data:
                setattr(day, field, request.data[field])
        day.save()
        return Response(_day_payload(request.user, target_date))


class WaterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        target_date = _parse_date(request.data.get('date', date.today()))
        if not target_date:
            return Response({'detail': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        amount = float(request.data.get('amount_liters', 0))
        day, _ = NutritionDay.objects.get_or_create(user=request.user, date=target_date)
        # amount может быть отрицательным (кнопка «минус») — не ниже нуля.
        day.water_liters = min(max(round(day.water_liters + amount, 2), 0.0), 10.0)
        day.save(update_fields=['water_liters'])
        return Response({'date': str(target_date), 'liters': day.water_liters, 'target': day.target_water_liters})


class FoodEntriesView(APIView):
    """Добавление позиций в дневник: {date, source, entries: [{name, grams, ...}]}."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        target_date = _parse_date(request.data.get('date', date.today()))
        if not target_date:
            return Response({'detail': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        raw_entries = request.data.get('entries')
        if not isinstance(raw_entries, list) or not raw_entries or len(raw_entries) > 30:
            return Response({'detail': 'Передайте от 1 до 30 позиций.'}, status=status.HTTP_400_BAD_REQUEST)

        source = request.data.get('source')
        valid_sources = {choice for choice, _ in FoodEntry.SOURCE_CHOICES}
        if source not in valid_sources:
            source = 'manual'

        serializer = FoodEntrySerializer(data=raw_entries, many=True)
        serializer.is_valid(raise_exception=True)
        FoodEntry.objects.bulk_create([
            FoodEntry(user=request.user, date=target_date, source=source, **item)
            for item in serializer.validated_data
        ])
        return Response(_day_payload(request.user, target_date), status=status.HTTP_201_CREATED)


class FoodEntryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, entry_id):
        entry = FoodEntry.objects.filter(user=request.user, id=entry_id).first()
        if not entry:
            return Response(status=status.HTTP_404_NOT_FOUND)
        target_date = entry.date
        entry.delete()
        return Response(_day_payload(request.user, target_date))


class AnalyzePhotoView(APIView):
    """Фото еды → распознанные позиции с КБЖУ (в дневник НЕ пишет —
    пользователь сначала подтверждает в модалке)."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'nutrition-ai'

    ALLOWED_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
    MAX_SIZE = 10 * 1024 * 1024

    def post(self, request):
        image = request.FILES.get('image')
        if not image:
            return Response({'detail': 'Прикрепите фото.'}, status=status.HTTP_400_BAD_REQUEST)
        if image.size > self.MAX_SIZE:
            return Response({'detail': 'Фото больше 10 МБ.'}, status=status.HTTP_400_BAD_REQUEST)
        media_type = image.content_type if image.content_type in self.ALLOWED_TYPES else 'image/jpeg'

        try:
            result = ai.analyze_food_photo(image.read(), media_type)
        except ai.AIError as err:
            return Response({'detail': err.detail}, status=err.status)
        return Response(result)


class AnalyzeVoiceView(APIView):
    """Голосовое (или текст) → расшифровка + позиции с КБЖУ."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'nutrition-ai'

    MAX_SIZE = 15 * 1024 * 1024

    def post(self, request):
        audio = request.FILES.get('audio')
        text = str(request.data.get('text', '')).strip()

        try:
            if audio:
                if audio.size > self.MAX_SIZE:
                    return Response({'detail': 'Запись больше 15 МБ.'}, status=status.HTTP_400_BAD_REQUEST)
                result = ai.analyze_food_audio(
                    audio.read(),
                    audio.name or 'voice.webm',
                    audio.content_type or 'audio/webm',
                )
            elif text:
                result = ai.analyze_food_text(text)
                result['transcript'] = text
            else:
                return Response({'detail': 'Запишите голосовое или напишите текстом.'}, status=status.HTTP_400_BAD_REQUEST)
        except ai.AIError as err:
            return Response({'detail': err.detail}, status=err.status)

        return Response(result)


def _off_per100(nutriments):
    def num(key):
        value = nutriments.get(key)
        try:
            return round(float(value), 1)
        except (TypeError, ValueError):
            return None

    return {
        'calories': num('energy-kcal_100g'),
        'protein': num('proteins_100g'),
        'fats': num('fat_100g'),
        'carbs': num('carbohydrates_100g'),
    }


class BarcodeView(APIView):
    """Продукт по штрих-коду из Open Food Facts (кэш сутки)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, code):
        code = ''.join(ch for ch in str(code) if ch.isdigit())
        if not (6 <= len(code) <= 14):
            return Response({'detail': 'Некорректный штрих-код.'}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f'off:barcode:{code}'
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached) if cached else Response({'detail': 'Продукт не найден.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            response = requests.get(
                f'https://world.openfoodfacts.org/api/v2/product/{code}.json',
                params={'fields': 'product_name,product_name_ru,brands,nutriments'},
                headers=OFF_HEADERS, timeout=OFF_TIMEOUT,
            )
        except requests.RequestException:
            return Response({'detail': 'База продуктов недоступна. Попробуйте позже.'}, status=status.HTTP_502_BAD_GATEWAY)

        product = response.json().get('product') if response.status_code == 200 else None
        name = (product or {}).get('product_name_ru') or (product or {}).get('product_name') or ''
        per100 = _off_per100((product or {}).get('nutriments') or {})
        if not product or not name or per100['calories'] is None:
            # Кэшируем и «не найдено», чтобы не долбить OFF повторными сканами.
            cache.set(cache_key, False, 3600)
            return Response({'detail': 'Продукт не найден.'}, status=status.HTTP_404_NOT_FOUND)

        payload = {'code': code, 'name': name[:200], 'brand': str((product or {}).get('brands') or '')[:100], 'per100': per100}
        cache.set(cache_key, payload, 86400)
        return Response(payload)


class FoodSearchView(APIView):
    """Поиск продуктов по названию в Open Food Facts."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = str(request.query_params.get('q', '')).strip()
        if len(query) < 2:
            return Response({'items': []})

        cache_key = f'off:search:{query.lower()[:80]}'
        cached = cache.get(cache_key)
        if cached is not None:
            return Response({'items': cached})

        try:
            response = requests.get(
                'https://search.openfoodfacts.org/search',
                params={'q': query, 'page_size': 20, 'fields': 'code,product_name,product_name_ru,brands,nutriments'},
                headers=OFF_HEADERS, timeout=OFF_TIMEOUT,
            )
            response.raise_for_status()
            hits = response.json().get('hits', [])
        except (requests.RequestException, ValueError):
            return Response({'detail': 'База продуктов недоступна. Попробуйте позже.'}, status=status.HTTP_502_BAD_GATEWAY)

        items = []
        for hit in hits:
            name = hit.get('product_name_ru') or hit.get('product_name') or ''
            per100 = _off_per100(hit.get('nutriments') or {})
            if not name or per100['calories'] is None:
                continue
            brands = hit.get('brands')
            if isinstance(brands, list):
                brands = ', '.join(brands)
            items.append({
                'code': str(hit.get('code', '')),
                'name': str(name)[:200],
                'brand': str(brands or '')[:100],
                'per100': per100,
            })
            if len(items) >= 10:
                break

        cache.set(cache_key, items, 3600)
        return Response({'items': items})
