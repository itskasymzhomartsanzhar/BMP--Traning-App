from datetime import date

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import NutritionDay, Meal, Recipe
from .serializers import NutritionDaySerializer, MealSerializer, MealCreateSerializer, RecipeSerializer


class NutritionDayView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_or_create_day(self, user, target_date):
        day, _ = NutritionDay.objects.get_or_create(
            user=user, date=target_date,
            defaults={
                'target_calories': 2200,
                'target_protein': 170,
                'target_fats': 70,
                'target_carbs': 230,
                'target_water_liters': 2.5,
            },
        )
        return day

    def get(self, request):
        target_date = request.query_params.get('date', str(date.today()))
        try:
            target_date = date.fromisoformat(target_date)
        except ValueError:
            return Response({'detail': 'Invalid date format, use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)

        day = self._get_or_create_day(request.user, target_date)
        return Response(NutritionDaySerializer(day).data)

    def patch(self, request):
        target_date = request.query_params.get('date', str(date.today()))
        try:
            target_date = date.fromisoformat(target_date)
        except ValueError:
            return Response({'detail': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        day = self._get_or_create_day(request.user, target_date)
        allowed_fields = ['target_calories', 'target_protein', 'target_fats', 'target_carbs', 'target_water_liters']
        for field in allowed_fields:
            if field in request.data:
                setattr(day, field, request.data[field])
        day.save()
        return Response(NutritionDaySerializer(day).data)


class WaterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        target_date = request.data.get('date', str(date.today()))
        try:
            target_date = date.fromisoformat(str(target_date))
        except ValueError:
            return Response({'detail': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        amount = float(request.data.get('amount_liters', 0))
        day, _ = NutritionDay.objects.get_or_create(user=request.user, date=target_date)
        day.water_liters = min(round(day.water_liters + amount, 2), 10.0)
        day.save(update_fields=['water_liters'])
        return Response({'date': str(target_date), 'liters': day.water_liters, 'target': day.target_water_liters})


class MealListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        target_date = request.query_params.get('date', str(date.today()))
        try:
            target_date = date.fromisoformat(target_date)
        except ValueError:
            return Response({'detail': 'Invalid date'}, status=status.HTTP_400_BAD_REQUEST)

        day = NutritionDay.objects.filter(user=request.user, date=target_date).first()
        if not day:
            return Response([])
        return Response(MealSerializer(day.meals.all(), many=True).data)

    def post(self, request):
        target_date = request.data.get('date', str(date.today()))
        try:
            target_date = date.fromisoformat(str(target_date))
        except ValueError:
            return Response({'detail': 'Invalid date'}, status=status.HTTP_400_BAD_REQUEST)

        day, _ = NutritionDay.objects.get_or_create(user=request.user, date=target_date)
        serializer = MealCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        meal = serializer.save(day=day)
        return Response(MealSerializer(meal).data, status=status.HTTP_201_CREATED)


class MealDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_meal(self, request, meal_id):
        try:
            return Meal.objects.get(id=meal_id, day__user=request.user)
        except Meal.DoesNotExist:
            return None

    def patch(self, request, meal_id):
        meal = self._get_meal(request, meal_id)
        if not meal:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'status' in request.data:
            meal.status = request.data['status']
        if 'calories' in request.data:
            meal.calories = request.data['calories']
        meal.save()
        return Response(MealSerializer(meal).data)

    def delete(self, request, meal_id):
        meal = self._get_meal(request, meal_id)
        if not meal:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        meal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RecipeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        recipes = Recipe.objects.filter(is_active=True)
        return Response(RecipeSerializer(recipes, many=True).data)


class RecipeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, recipe_id):
        try:
            recipe = Recipe.objects.get(id=recipe_id, is_active=True)
        except Recipe.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(RecipeSerializer(recipe).data)
