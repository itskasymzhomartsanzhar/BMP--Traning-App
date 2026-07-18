import json
import uuid
from datetime import date

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Subscription, Payment


def _get_or_create_subscription(user):
    sub, _ = Subscription.objects.get_or_create(user=user)
    return sub


class SubscriptionPlansView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        plans = []
        for plan_id, plan_data in settings.SUBSCRIPTION_PLANS.items():
            plans.append({'id': plan_id, **plan_data})
        return Response(plans)


class MySubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sub = _get_or_create_subscription(request.user)
        return Response({
            'plan': sub.plan_display,
            'status': sub.get_status_display(),
            'next_charge': sub.next_charge_display,
            'is_premium': sub.is_premium,
            'features': [
                'Безлимитные программы тренировок',
                'AI-персонализированный план питания',
                'Расширенная аналитика',
                'Видео-инструкции к упражнениям',
                'Калькулятор TDEE / ИМТ / Макросов',
                'Приоритетная поддержка 24/7',
                'Экспорт данных в PDF/CSV',
            ] if sub.is_premium else [],
        })

    def delete(self, request):
        sub = _get_or_create_subscription(request.user)
        sub.status = 'cancelled'
        sub.save(update_fields=['status'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class CreatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        if plan_id not in settings.SUBSCRIPTION_PLANS:
            return Response({'detail': 'Invalid plan'}, status=status.HTTP_400_BAD_REQUEST)

        plan_data = settings.SUBSCRIPTION_PLANS[plan_id]
        amount = plan_data['price']

        payment = Payment.objects.create(
            user=request.user,
            plan=plan_id,
            amount=amount,
            currency=plan_data['currency'],
        )

        if not settings.YOOKASSA_SHOP_ID or settings.YOOKASSA_SHOP_ID == 'dev_shop_id':
            payment.status = 'succeeded'
            payment.save(update_fields=['status'])
            _activate_subscription(request.user, plan_id, str(payment.id))
            return Response({
                'payment_id': str(payment.id),
                'status': 'succeeded',
                'confirmation_url': None,
            })

        try:
            import yookassa
            yookassa.Configuration.account_id = settings.YOOKASSA_SHOP_ID
            yookassa.Configuration.secret_key = settings.YOOKASSA_SECRET_KEY

            yk_payment = yookassa.Payment.create({
                'amount': {'value': str(amount), 'currency': 'RUB'},
                'confirmation': {
                    'type': 'redirect',
                    'return_url': request.data.get('return_url', 'https://t.me'),
                },
                'capture': True,
                'description': f'TrainApp {plan_data["label"]} для пользователя {request.user.tg_id}',
                'metadata': {'user_id': str(request.user.id), 'plan_id': plan_id, 'payment_db_id': str(payment.id)},
            }, str(uuid.uuid4()))

            payment.yookassa_payment_id = yk_payment.id
            payment.confirmation_url = yk_payment.confirmation.confirmation_url
            payment.save(update_fields=['yookassa_payment_id', 'confirmation_url'])

            return Response({
                'payment_id': str(payment.id),
                'status': 'pending',
                'confirmation_url': payment.confirmation_url,
            })

        except Exception as e:
            payment.status = 'cancelled'
            payment.save(update_fields=['status'])
            return Response({'detail': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


def _activate_subscription(user, plan_id, payment_id):
    from datetime import date
    from dateutil.relativedelta import relativedelta
    sub = _get_or_create_subscription(user)
    sub.plan = plan_id
    sub.status = 'active'
    sub.yookassa_payment_id = payment_id
    today = date.today()
    if plan_id == 'monthly':
        sub.next_charge_date = today + relativedelta(months=1)
    elif plan_id == 'annual':
        sub.next_charge_date = today + relativedelta(years=1)
    sub.save()


@method_decorator(csrf_exempt, name='dispatch')
class YooKassaWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return Response({'detail': 'invalid json'}, status=status.HTTP_400_BAD_REQUEST)

        event = body.get('event')
        payment_obj = body.get('object', {})
        yk_payment_id = payment_obj.get('id', '')

        payment = Payment.objects.filter(yookassa_payment_id=yk_payment_id).first()
        if not payment:
            return Response(status=status.HTTP_200_OK)

        if event == 'payment.succeeded':
            payment.status = 'succeeded'
            payment.save(update_fields=['status'])
            _activate_subscription(payment.user, payment.plan, yk_payment_id)

        elif event == 'payment.canceled':
            payment.status = 'cancelled'
            payment.save(update_fields=['status'])

        return Response(status=status.HTTP_200_OK)
