from rest_framework import serializers
from .models import NutritionDay, FoodEntry


class NutritionDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionDay
        fields = [
            'id', 'date', 'target_calories', 'target_protein', 'target_fats', 'target_carbs',
            'target_water_liters', 'water_liters',
        ]
        read_only_fields = ['id', 'date']


class FoodEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodEntry
        fields = ['id', 'name', 'grams', 'calories', 'protein', 'fats', 'carbs', 'source', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Укажите название.')
        return value[:200]

    def validate_grams(self, value):
        if value is not None and not (0 < value <= 5000):
            raise serializers.ValidationError('Порция должна быть от 1 до 5000 г.')
        return value

    def validate_calories(self, value):
        if not (0 <= value <= 10000):
            raise serializers.ValidationError('Калории должны быть от 0 до 10000.')
        return value

    @staticmethod
    def _validate_macro(value):
        if not (0 <= value <= 1000):
            raise serializers.ValidationError('Значение должно быть от 0 до 1000 г.')
        return value

    def validate_protein(self, value):
        return self._validate_macro(value)

    def validate_fats(self, value):
        return self._validate_macro(value)

    def validate_carbs(self, value):
        return self._validate_macro(value)
