from rest_framework.test import APITestCase

from .models import User


ONBOARDING_PAYLOAD = {
    'name': 'Тест',
    'birth_date': '2000-01-01',
    'gender': 'male',
    'height': 180,
    'weight': 75,
    'goal': 'cut',
    'level': 'beginner',
    'place': 'home',
    'injuries': [],
    'training_days': ['mon', 'thu'],
}


class TelegramOnboardingAccountTests(APITestCase):
    def test_tg_user_sets_email_and_password(self):
        user = User.objects.create_user(tg_id=111, first_name='TG')
        self.client.force_authenticate(user)

        response = self.client.post('/api/users/me/onboarding/', {
            **ONBOARDING_PAYLOAD,
            'email': 'TG@Example.com',
            'password': 'supersecret1',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.is_onboarded)
        self.assertEqual(user.email, 'tg@example.com')
        self.assertTrue(user.check_password('supersecret1'))

    def test_email_user_credentials_not_overwritten(self):
        user = User.objects.create_user(tg_id=None, email='owner@example.com', password='original-pass')
        self.client.force_authenticate(user)

        response = self.client.post('/api/users/me/onboarding/', {
            **ONBOARDING_PAYLOAD,
            'email': 'hacker@example.com',
            'password': 'newpass12345',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.email, 'owner@example.com')
        self.assertTrue(user.check_password('original-pass'))

    def test_duplicate_email_rejected(self):
        User.objects.create_user(tg_id=None, email='taken@example.com', password='whatever12')
        user = User.objects.create_user(tg_id=222, first_name='TG2')
        self.client.force_authenticate(user)

        response = self.client.post('/api/users/me/onboarding/', {
            **ONBOARDING_PAYLOAD,
            'email': 'taken@example.com',
            'password': 'supersecret1',
        }, format='json')

        self.assertEqual(response.status_code, 400)

    def test_onboarding_without_account_fields_still_works(self):
        user = User.objects.create_user(tg_id=333, first_name='TG3')
        self.client.force_authenticate(user)

        response = self.client.post('/api/users/me/onboarding/', ONBOARDING_PAYLOAD, format='json')

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.is_onboarded)
        self.assertEqual(user.email, '')


class TelegramWidgetAuthTests(APITestCase):
    def test_garbage_id_token_rejected(self):
        response = self.client.post('/api/auth/telegram-widget/', {'id_token': 'garbage'}, format='json')
        self.assertEqual(response.status_code, 403)

    def test_legacy_payload_with_bad_hash_rejected(self):
        response = self.client.post('/api/auth/telegram-widget/', {
            'id': 1, 'auth_date': 1, 'hash': 'bad',
        }, format='json')
        self.assertEqual(response.status_code, 403)
