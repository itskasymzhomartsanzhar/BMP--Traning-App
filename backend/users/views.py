from datetime import date, timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .auth import WebAppAuth, LoginWidgetAuth, AuthError
from .models import User
from .recommendation import recommend_program, recommend_training_days
from .serializers import (
    UserSerializer, UserUpdateSerializer, OnboardingSerializer,
    EmailRegisterSerializer, EmailLoginSerializer,
)


def _get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


class TelegramAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        init_data = request.data.get('init_data', '')

        if settings.TELEGRAM_DEV_MODE and not init_data:
            user, _ = User.objects.get_or_create(
                tg_id=0,
                defaults={
                    'username': 'devuser',
                    'first_name': 'Dev',
                    'display_name': 'Dev User',
                    'gender': 'male',
                    'weight': 85.0,
                    'height': 182,
                    'goal': 'cut',
                    'training_days': ['mon', 'wed', 'fri'],
                },
            )
            return Response({'tokens': _get_tokens(user), 'user': UserSerializer(user).data})

        if not init_data:
            return Response({'detail': 'init_data required'}, status=status.HTTP_400_BAD_REQUEST)

        bot_token = settings.TELEGRAM_BOT_TOKEN
        if not bot_token:
            return Response({'detail': 'Bot token not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            auth = WebAppAuth(bot_token)
            user_data = auth.get_user_data(init_data)
        except AuthError as e:
            return Response({'detail': e.detail}, status=e.status)

        user, created = User.objects.get_or_create(
            tg_id=user_data['tg_id'],
            defaults={
                'username': user_data.get('username', ''),
                'first_name': user_data.get('first_name', ''),
                'avatar_url': user_data.get('avatar_url', ''),
            },
        )

        if not created:
            updated = False
            if user_data.get('avatar_url') and user.avatar_url != user_data['avatar_url']:
                user.avatar_url = user_data['avatar_url']
                updated = True
            if user_data.get('first_name') and not user.first_name:
                user.first_name = user_data['first_name']
                updated = True
            if updated:
                user.save(update_fields=['avatar_url', 'first_name'])

        return Response({'tokens': _get_tokens(user), 'user': UserSerializer(user).data})


class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'refresh required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = RefreshToken(refresh_token)
            return Response({'access': str(refresh.access_token)})
        except Exception:
            return Response({'detail': 'Invalid or expired token'}, status=status.HTTP_401_UNAUTHORIZED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()

        from workouts.models import WorkoutSession
        sessions_this_week = WorkoutSession.objects.filter(
            user=user,
            status='completed',
            started_at__date__gte=today - timedelta(days=today.weekday()),
            started_at__date__lte=today,
        )

        streak = self._compute_streak(user)

        training_days = user.training_days or ['mon', 'wed', 'fri']
        target = len(training_days)
        completed_count = sessions_this_week.count()

        day_names = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        day_labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        week_start = today - timedelta(days=today.weekday())

        completed_dates = set(
            s.started_at.date() for s in sessions_this_week
        )

        days = []
        for i, (key, label) in enumerate(zip(day_names, day_labels)):
            day_date = week_start + timedelta(days=i)
            scheduled = key in training_days
            if day_date < today and day_date in completed_dates:
                state = 'done'
            elif day_date == today:
                state = 'active'
            else:
                state = 'default'

            day_plan = []
            if scheduled:
                day_plan.append({'title': 'Силовая', 'subtitle': 'По расписанию'})
            if day_date in completed_dates:
                day_plan.append({'title': 'Тренировка выполнена', 'subtitle': 'Отличная работа ✓'})

            days.append({
                'id': key,
                'label': label,
                'date': day_date.day,
                'state': state,
                'scheduled': scheduled,
                'is_today': day_date == today,
                'plan': day_plan,
            })

        weight_display = f'{user.weight} кг' if user.weight else '—'
        activity_days = self._compute_activity_days(user)

        from nutrition.models import NutritionDay
        nutrition_today = NutritionDay.objects.filter(user=user, date=today).first()
        today_plan = []
        if training_days and day_names[today.weekday()] in training_days:
            today_plan.append({'title': 'Силовая', 'subtitle': 'По расписанию'})
        if nutrition_today:
            today_plan.append({
                'title': 'Питание',
                'subtitle': f'{nutrition_today.target_calories} ккал · белок {nutrition_today.target_protein}г',
            })

        return Response({
            'greeting': f'Привет, {user.name}!',
            'stats': {
                'current_weight': weight_display,
                'current_weight_kg': user.weight,
                'total_workouts': user.workout_count,
                'activity_days': activity_days,
            },
            'streak': streak,
            'weekly_goal': {
                'target': target,
                'completed': completed_count,
                'days': days,
            },
            'today_plan': today_plan,
        })

    def _compute_streak(self, user):
        from workouts.models import WorkoutSession
        today = date.today()
        streak = 0
        current = today
        while True:
            has_session = WorkoutSession.objects.filter(
                user=user, status='completed', started_at__date=current
            ).exists()
            if not has_session:
                if current == today:
                    current -= timedelta(days=1)
                    continue
                break
            streak += 1
            current -= timedelta(days=1)
        return streak

    def _compute_activity_days(self, user):
        from workouts.models import WorkoutSession
        return WorkoutSession.objects.filter(
            user=user, status='completed'
        ).dates('started_at', 'day').count()


class TrainingScheduleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'days': request.user.training_days or []})

    def put(self, request):
        days = request.data.get('days', [])
        valid_days = {'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'}
        days = [d for d in days if d in valid_days]
        request.user.training_days = days
        request.user.save(update_fields=['training_days'])
        return Response({'days': days})


def _serialize_program(program_id):
    if not program_id:
        return None
    from workouts.models import WorkoutProgram
    from workouts.serializers import WorkoutProgramSerializer
    program = WorkoutProgram.objects.filter(id=program_id).first()
    return WorkoutProgramSerializer(program).data if program else None


def _apply_onboarding(user, data):
    """Записывает анкету в профиль, подбирает программу и расписание."""
    user.display_name = data['name']
    user.birth_date = data['birth_date']
    user.gender = data.get('gender', '') or user.gender
    user.height = data['height']
    user.weight = data['weight']
    user.goal = data['goal']
    user.level = data['level']
    user.place = data.get('place', '')
    user.injuries = data.get('injuries', [])

    if user.level == 'custom':
        # «Своя программа»: ничего не рекомендуем — человек сам выбирает
        # дни и упражнения уже в приложении.
        program_id, reason = None, ''
        user.recommended_program = ''
        chosen_days = data.get('training_days') or []
        if chosen_days:
            user.training_days = chosen_days
    else:
        program_id, reason = recommend_program(
            goal=user.goal,
            level=user.level,
            place=user.place,
            injuries=user.injuries,
            age=user.age,
        )
        user.recommended_program = program_id or ''

        # Дни из анкеты главнее; без них — прежнее расписание или рекомендация.
        chosen_days = data.get('training_days') or []
        if chosen_days:
            user.training_days = chosen_days
        elif not user.training_days:
            user.training_days = recommend_training_days(user.level)

    user.onboarded_at = timezone.now()
    user.save()

    return {
        'program_id': program_id,
        'reason': reason,
        'program': _serialize_program(program_id),
        'training_days': user.training_days,
    }


class OnboardingView(APIView):
    """Приём анкеты новичка и подбор стартовой программы."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'is_onboarded': user.is_onboarded,
            'recommended_program': user.recommended_program,
        })

    def post(self, request):
        serializer = OnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        recommendation = _apply_onboarding(request.user, serializer.validated_data)
        return Response({
            'user': UserSerializer(request.user).data,
            'recommendation': recommendation,
        }, status=status.HTTP_200_OK)


class PlanPreviewView(APIView):
    """Подбор плана по анкете БЕЗ создания аккаунта — гость видит план до регистрации."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        birth = data['birth_date']
        today = date.today()
        age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))

        if data['level'] == 'custom':
            # «Своя программа» — плана нет, человек собирает всё сам.
            return Response({
                'program_id': None,
                'reason': '',
                'program': None,
                'training_days': data.get('training_days') or [],
            })

        program_id, reason = recommend_program(
            goal=data['goal'],
            level=data['level'],
            place=data.get('place', ''),
            injuries=data.get('injuries', []),
            age=age,
        )
        return Response({
            'program_id': program_id,
            'reason': reason,
            'program': _serialize_program(program_id),
            'training_days': data.get('training_days') or recommend_training_days(data['level']),
        })


class EmailRegisterView(APIView):
    """Регистрация по почте: анкета уже пройдена гостем, создаём аккаунт целиком."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = User.objects.create_user(
            tg_id=None,
            password=data['password'],
            email=data['email'],
        )
        recommendation = _apply_onboarding(user, data)

        return Response({
            'tokens': _get_tokens(user),
            'user': UserSerializer(user).data,
            'recommendation': recommendation,
        }, status=status.HTTP_201_CREATED)


class EmailLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()
        password = serializer.validated_data['password']

        user = User.objects.filter(email__iexact=email).exclude(email='').first()
        if not user or not user.check_password(password) or not user.is_active:
            return Response(
                {'detail': 'Неверная почта или пароль.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response({'tokens': _get_tokens(user), 'user': UserSerializer(user).data})


class TelegramWidgetAuthView(APIView):
    """Вход на сайте через Telegram Login Widget: создаёт аккаунт или логинит."""
    permission_classes = [AllowAny]

    def post(self, request):
        bot_token = settings.TELEGRAM_BOT_TOKEN
        if not bot_token:
            return Response({'detail': 'Bot token not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            user_data = LoginWidgetAuth(bot_token).get_user_data(dict(request.data))
        except (AuthError, KeyError, ValueError):
            return Response({'detail': 'Не удалось подтвердить данные Telegram.'}, status=status.HTTP_403_FORBIDDEN)

        user, created = User.objects.get_or_create(
            tg_id=user_data['tg_id'],
            defaults={
                'username': user_data.get('username', ''),
                'first_name': user_data.get('first_name', ''),
                'avatar_url': user_data.get('avatar_url', ''),
            },
        )
        if not created and user_data.get('avatar_url') and user.avatar_url != user_data['avatar_url']:
            user.avatar_url = user_data['avatar_url']
            user.save(update_fields=['avatar_url'])

        return Response({'tokens': _get_tokens(user), 'user': UserSerializer(user).data})


class LinkTelegramView(APIView):
    """Привязка Telegram к email-аккаунту из настроек профиля."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.tg_id:
            return Response({'detail': 'Telegram уже подключён.'}, status=status.HTTP_400_BAD_REQUEST)

        bot_token = settings.TELEGRAM_BOT_TOKEN
        if not bot_token:
            return Response({'detail': 'Bot token not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            user_data = LoginWidgetAuth(bot_token).get_user_data(dict(request.data))
        except (AuthError, KeyError, ValueError):
            return Response({'detail': 'Не удалось подтвердить данные Telegram.'}, status=status.HTTP_403_FORBIDDEN)

        tg_id = user_data['tg_id']
        if User.objects.filter(tg_id=tg_id).exclude(pk=request.user.pk).exists():
            return Response(
                {'detail': 'Этот Telegram уже привязан к другому аккаунту.'},
                status=status.HTTP_409_CONFLICT,
            )

        user = request.user
        user.tg_id = tg_id
        if not user.username:
            user.username = user_data.get('username', '')
        if not user.avatar_url:
            user.avatar_url = user_data.get('avatar_url', '')
        user.save(update_fields=['tg_id', 'username', 'avatar_url'])

        return Response({'user': UserSerializer(user).data})
