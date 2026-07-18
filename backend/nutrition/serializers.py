from rest_framework import serializers
from .models import NutritionDay, Meal, MealItem, Recipe


class MealItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealItem
        fields = ['id', 'description']


class MealSerializer(serializers.ModelSerializer):
    items = MealItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(read_only=True)
    time = serializers.TimeField(source='scheduled_time', format='%H:%M')
    type = serializers.CharField(source='meal_type')
    kcal = serializers.IntegerField(source='calories')

    class Meta:
        model = Meal
        fields = ['id', 'type', 'title', 'time', 'kcal', 'protein', 'fats', 'carbs', 'status', 'status_display', 'items']


class MealCreateSerializer(serializers.ModelSerializer):
    items = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    time = serializers.TimeField(source='scheduled_time')
    type = serializers.CharField(source='meal_type')
    kcal = serializers.IntegerField(source='calories')

    class Meta:
        model = Meal
        fields = ['type', 'title', 'time', 'kcal', 'protein', 'fats', 'carbs', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        meal = Meal.objects.create(**validated_data)
        for item_text in items_data:
            MealItem.objects.create(meal=meal, description=item_text)
        return meal


class NutritionDaySerializer(serializers.ModelSerializer):
    meals = MealSerializer(many=True, read_only=True)
    eaten_calories = serializers.IntegerField(read_only=True)
    eaten_protein = serializers.IntegerField(read_only=True)
    eaten_fats = serializers.IntegerField(read_only=True)
    eaten_carbs = serializers.IntegerField(read_only=True)

    class Meta:
        model = NutritionDay
        fields = [
            'id', 'date', 'target_calories', 'target_protein', 'target_fats', 'target_carbs',
            'target_water_liters', 'water_liters',
            'eaten_calories', 'eaten_protein', 'eaten_fats', 'eaten_carbs',
            'meals',
        ]
        read_only_fields = ['id', 'date']


class RecipeSerializer(serializers.ModelSerializer):
    macros = serializers.CharField(source='macros_display', read_only=True)
    time = serializers.CharField(source='time_display', read_only=True)
    calories_display = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'calories', 'calories_display', 'protein', 'fats', 'carbs', 'macros', 'prep_minutes', 'time', 'ingredients', 'steps']

    def get_calories_display(self, obj):
        return f'{obj.calories} ккал'
