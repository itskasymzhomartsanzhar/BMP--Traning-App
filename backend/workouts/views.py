from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ExerciseTemplate, WorkoutProgram, WorkoutSession, ExerciseLog, WorkoutExercise
from .serializers import (
    ExerciseTemplateSerializer, WorkoutProgramSerializer,
    WorkoutProgramListSerializer, WorkoutSessionSerializer, ExerciseLogInputSerializer,
)


class ExerciseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        templates = ExerciseTemplate.objects.all()
        return Response(ExerciseTemplateSerializer(templates, many=True).data)


class ExerciseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        try:
            template = ExerciseTemplate.objects.get(slug=slug)
        except ExerciseTemplate.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ExerciseTemplateSerializer(template).data)


class WorkoutCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        mode = request.query_params.get('mode')

        def build_mode_data(m):
            featured = WorkoutProgram.objects.filter(mode=m, is_featured=True, is_active=True).first()
            programs = WorkoutProgram.objects.filter(mode=m, is_active=True).order_by('title')
            return {
                'featured': WorkoutProgramListSerializer(featured).data if featured else None,
                'programs': WorkoutProgramListSerializer(programs, many=True).data,
            }

        if mode in ('gym', 'home'):
            return Response(build_mode_data(mode))

        return Response({
            'gym': build_mode_data('gym'),
            'home': build_mode_data('home'),
        })


class WorkoutDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, workout_id):
        try:
            program = WorkoutProgram.objects.prefetch_related('exercises__template').get(id=workout_id, is_active=True)
        except WorkoutProgram.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(WorkoutProgramSerializer(program).data)


class WorkoutSessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = WorkoutSession.objects.filter(user=request.user).order_by('-started_at')[:20]
        return Response(WorkoutSessionSerializer(sessions, many=True).data)

    def post(self, request):
        workout_id = request.data.get('workout_id')
        started_at = request.data.get('started_at')

        if not workout_id:
            return Response({'detail': 'workout_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            workout = WorkoutProgram.objects.get(id=workout_id, is_active=True)
        except WorkoutProgram.DoesNotExist:
            return Response({'detail': 'Workout not found'}, status=status.HTTP_404_NOT_FOUND)

        session = WorkoutSession.objects.create(
            user=request.user,
            workout=workout,
            started_at=started_at or timezone.now(),
        )
        return Response(WorkoutSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class WorkoutSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_session(self, request, session_id):
        try:
            return WorkoutSession.objects.get(id=session_id, user=request.user)
        except WorkoutSession.DoesNotExist:
            return None

    def get(self, request, session_id):
        session = self._get_session(request, session_id)
        if not session:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(WorkoutSessionSerializer(session).data)

    def patch(self, request, session_id):
        session = self._get_session(request, session_id)
        if not session:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'elapsed_seconds' in request.data:
            session.elapsed_seconds = request.data['elapsed_seconds']
        if 'status' in request.data and request.data['status'] == 'abandoned':
            session.status = 'abandoned'
        session.save()
        return Response(WorkoutSessionSerializer(session).data)

    def delete(self, request, session_id):
        session = self._get_session(request, session_id)
        if not session:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        session.status = 'abandoned'
        session.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CompleteSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = WorkoutSession.objects.get(id=session_id, user=request.user)
        except WorkoutSession.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if session.status == 'completed':
            return Response(WorkoutSessionSerializer(session).data)

        ended_at = request.data.get('ended_at', timezone.now())
        exercise_logs_data = request.data.get('exercise_logs', [])

        session.status = 'completed'
        session.ended_at = ended_at
        if 'elapsed_seconds' in request.data:
            session.elapsed_seconds = request.data['elapsed_seconds']
        session.save()

        for log_data in exercise_logs_data:
            serializer = ExerciseLogInputSerializer(data=log_data)
            if serializer.is_valid():
                d = serializer.validated_data
                try:
                    template = ExerciseTemplate.objects.get(slug=d['template_slug'])
                except ExerciseTemplate.DoesNotExist:
                    continue
                original = None
                if d.get('original_exercise_id'):
                    original = WorkoutExercise.objects.filter(id=d['original_exercise_id']).first()
                ExerciseLog.objects.create(
                    session=session,
                    template=template,
                    original_exercise=original,
                    was_swapped=d['was_swapped'],
                    was_skipped=d['was_skipped'],
                    sets=d['sets'],
                    reps=d['reps'],
                    weight=d['weight'],
                )

        user = request.user
        user.workout_count += 1
        user.save(update_fields=['workout_count'])

        return Response(WorkoutSessionSerializer(session).data)
