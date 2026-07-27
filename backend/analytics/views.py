from datetime import date, timedelta

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from workouts.models import WorkoutSession


DAY_LABELS = {0: 'Пн', 1: 'Вт', 2: 'Ср', 3: 'Чт', 4: 'Пт', 5: 'Сб', 6: 'Вс'}
DAY_KEYS = {0: 'mon', 1: 'tue', 2: 'wed', 3: 'thu', 4: 'fri', 5: 'sat', 6: 'sun'}


class ActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        sessions = WorkoutSession.objects.filter(
            user=request.user,
            status='completed',
            started_at__date__gte=week_start,
            started_at__date__lte=week_end,
        )

        counts = {}
        for session in sessions:
            d = session.started_at.date()
            counts[d] = counts.get(d, 0) + 1

        result = []
        for i in range(7):
            d = week_start + timedelta(days=i)
            result.append({
                'day': DAY_LABELS[i],
                'key': DAY_KEYS[i],
                'date': str(d),
                'value': counts.get(d, 0),
            })

        return Response(result)


class StreakView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        dates_with_sessions = set(
            WorkoutSession.objects.filter(user=user, status='completed')
            .dates('started_at', 'day')
        )

        today = date.today()
        current_streak = 0
        d = today
        while d in dates_with_sessions:
            current_streak += 1
            d -= timedelta(days=1)
        if current_streak == 0:
            d = today - timedelta(days=1)
            while d in dates_with_sessions:
                current_streak += 1
                d -= timedelta(days=1)

        longest_streak = 0
        if dates_with_sessions:
            sorted_dates = sorted(dates_with_sessions)
            streak = 1
            max_streak = 1
            for i in range(1, len(sorted_dates)):
                if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
                    streak += 1
                    max_streak = max(max_streak, streak)
                else:
                    streak = 1
            longest_streak = max_streak

        return Response({'current': current_streak, 'longest': longest_streak})


class WeightHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from analytics.models import WeightEntry
        entries = WeightEntry.objects.filter(user=request.user).order_by('recorded_at')
        return Response([
            {'date': e.recorded_at.strftime('%d.%m'), 'value': e.value}
            for e in entries
        ])

    def post(self, request):
        from analytics.models import WeightEntry
        value = request.data.get('value')
        recorded_at = request.data.get('recorded_at', str(date.today()))
        if not value:
            from rest_framework import status
            return Response({'detail': 'value required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            recorded_date = date.fromisoformat(str(recorded_at))
        except ValueError:
            from rest_framework import status
            return Response({'detail': 'Некорректная дата.'}, status=status.HTTP_400_BAD_REQUEST)

        # Замер за дату один (unique user+recorded_at): повторный ввод
        # в тот же день обновляет значение, а не падает 500-й.
        entry, _ = WeightEntry.objects.update_or_create(
            user=request.user,
            recorded_at=recorded_date,
            defaults={'value': float(value)},
        )
        request.user.weight = float(value)
        request.user.save(update_fields=['weight'])
        return Response({'date': entry.recorded_at.strftime('%d.%m'), 'value': entry.value})


class MeasurementsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from analytics.models import BodyMeasurement
        latest = BodyMeasurement.objects.filter(user=request.user).order_by('-recorded_at', '-id').first()
        if not latest:
            # Пустой список, а не None: DRF рендерит None пустым телом,
            # и axios на фронте получает '' вместо массива.
            return Response([])
        return Response(_measurement_to_dict(latest))

    def post(self, request):
        from analytics.models import BodyMeasurement
        from rest_framework import status as drf_status
        recorded_at = request.data.get('recorded_at', str(date.today()))

        # Замер за дату один: правка одного поля не должна затирать остальные
        # и плодить дубли, из-за которых GET возвращал старую запись.
        entry, created = BodyMeasurement.objects.get_or_create(
            user=request.user,
            recorded_at=recorded_at,
        )

        fields = ['weight', 'body_fat_percent', 'muscle_mass', 'neck_cm', 'chest_cm', 'waist_cm', 'hip_cm']
        changed = []
        for field in fields:
            if field in request.data:
                setattr(entry, field, request.data.get(field))
                changed.append(field)
        if changed:
            entry.save(update_fields=changed)

        if entry.weight:
            request.user.weight = entry.weight
            request.user.save(update_fields=['weight'])

        status_code = drf_status.HTTP_201_CREATED if created else drf_status.HTTP_200_OK
        return Response(_measurement_to_dict(entry), status=status_code)


def _measurement_to_dict(m):
    result = []
    if m.weight is not None:
        result.append({'label': 'Текущий вес', 'value': f'{m.weight} кг', 'field': 'weight'})
    if m.body_fat_percent is not None:
        result.append({'label': 'Процент жира', 'value': f'{m.body_fat_percent}%', 'field': 'body_fat_percent'})
    if m.muscle_mass is not None:
        result.append({'label': 'Мышечная масса', 'value': f'{m.muscle_mass} кг', 'field': 'muscle_mass'})
    # Обхваты — сверху вниз по телу: шея, грудь, талия, бёдра.
    if m.neck_cm is not None:
        result.append({'label': 'Шея', 'value': f'{m.neck_cm} см', 'field': 'neck_cm'})
    if m.chest_cm is not None:
        result.append({'label': 'Грудь', 'value': f'{m.chest_cm} см', 'field': 'chest_cm'})
    if m.waist_cm is not None:
        result.append({'label': 'Талия', 'value': f'{m.waist_cm} см', 'field': 'waist_cm'})
    if m.hip_cm is not None:
        result.append({'label': 'Бёдра', 'value': f'{m.hip_cm} см', 'field': 'hip_cm'})
    return result


class ProgressPhotosView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    MAX_SIZE = 15 * 1024 * 1024

    def _serialize(self, request, photo):
        return {
            'id': photo.id,
            'date': photo.taken_date.isoformat(),
            'date_display': photo.taken_date.strftime('%d.%m.%Y'),
            'angle': photo.angle,
            'url': request.build_absolute_uri(photo.image.url) if photo.image else '',
        }

    def get(self, request):
        from analytics.models import ProgressPhoto
        # По возрастанию даты: ползунок ведёт слева направо от старых к новым.
        photos = ProgressPhoto.objects.filter(user=request.user).order_by('taken_date', 'id')
        return Response([self._serialize(request, p) for p in photos])

    def post(self, request):
        from analytics.models import ProgressPhoto
        from rest_framework import status as drf_status

        photo_file = request.FILES.get('file')
        if not photo_file:
            return Response({'detail': 'Файл не передан.'}, status=drf_status.HTTP_400_BAD_REQUEST)
        if photo_file.size > self.MAX_SIZE:
            return Response({'detail': 'Файл больше 15 МБ.'}, status=drf_status.HTTP_400_BAD_REQUEST)
        if not (photo_file.content_type or '').startswith('image/'):
            return Response({'detail': 'Можно загружать только изображения.'}, status=drf_status.HTTP_400_BAD_REQUEST)

        photo = ProgressPhoto.objects.create(
            user=request.user,
            taken_date=date.today(),
            angle=request.data.get('angle', 'front'),
            image=photo_file,
        )
        return Response(self._serialize(request, photo), status=drf_status.HTTP_201_CREATED)
