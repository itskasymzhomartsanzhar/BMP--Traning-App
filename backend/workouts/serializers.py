from rest_framework import serializers
from .models import ExerciseTemplate, WorkoutProgram, WorkoutExercise, WorkoutSession, ExerciseLog


class ExerciseTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseTemplate
        fields = ['id', 'slug', 'name', 'description', 'muscle', 'video_url']


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='template.slug')
    name = serializers.CharField(source='template.name')
    description = serializers.CharField(source='template.description')
    muscle = serializers.CharField(source='template.muscle')
    video_url = serializers.CharField(source='template.video_url')
    rest = serializers.CharField(source='rest_display')

    class Meta:
        model = WorkoutExercise
        fields = ['id', 'name', 'description', 'muscle', 'sets', 'reps', 'weight', 'rest', 'video_url']


class WorkoutProgramSerializer(serializers.ModelSerializer):
    duration = serializers.CharField(source='duration_display')
    calories = serializers.CharField(source='calories_display')
    intensity = serializers.CharField(source='intensity_display')
    exercises = WorkoutExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutProgram
        fields = ['id', 'title', 'description', 'duration', 'calories', 'intensity', 'mode', 'tone', 'tag', 'is_featured', 'exercises']


class WorkoutProgramListSerializer(serializers.ModelSerializer):
    duration = serializers.CharField(source='duration_display')
    intensity = serializers.CharField(source='intensity_display')

    class Meta:
        model = WorkoutProgram
        fields = ['id', 'title', 'description', 'duration', 'intensity', 'mode', 'tone', 'tag', 'is_featured']


class ExerciseLogInputSerializer(serializers.Serializer):
    template_slug = serializers.CharField()
    original_exercise_id = serializers.IntegerField(allow_null=True, required=False)
    was_swapped = serializers.BooleanField(default=False)
    was_skipped = serializers.BooleanField(default=False)
    sets = serializers.IntegerField(min_value=0)
    reps = serializers.IntegerField(min_value=0)
    weight = serializers.CharField(default='—')


class WorkoutSessionSerializer(serializers.ModelSerializer):
    workout_id = serializers.CharField(source='workout.id', read_only=True)

    class Meta:
        model = WorkoutSession
        fields = ['id', 'workout_id', 'started_at', 'ended_at', 'elapsed_seconds', 'status']
        read_only_fields = ['id', 'started_at']
