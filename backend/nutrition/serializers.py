from rest_framework import serializers
from .models import NutritionDay


class NutritionDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionDay
        fields = [
            'id', 'date', 'target_calories', 'target_protein', 'target_fats', 'target_carbs',
            'target_water_liters', 'water_liters',
        ]
        read_only_fields = ['id', 'date']
