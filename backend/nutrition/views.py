from datetime import date

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import NutritionDay
from .serializers import NutritionDaySerializer


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
