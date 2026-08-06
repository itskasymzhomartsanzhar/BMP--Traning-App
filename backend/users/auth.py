import hashlib
import hmac
import json
import socket
import time
from dataclasses import dataclass
from operator import itemgetter
from typing import Any
from urllib.parse import unquote, parse_qsl, urlparse

import jwt
import requests
import urllib3
from django.core.cache import cache
from jwt import InvalidTokenError, PyJWK


@dataclass(eq=False)
class AuthError(Exception):
    status: int = 403
    detail: str = "unknown auth error"

    @property
    def message(self) -> str:
        return f"Auth error occurred, detail: {self.detail}"


class WebAppAuth:
    def __init__(self, bot_token: str) -> None:
        self._bot_token = bot_token
        self._secret_key = self._get_secret_key()

    def get_user_id(self, init_data: str) -> int:
        return int(json.loads(self._validate(init_data)["user"])["id"])

    def get_user_data(self, init_data: str) -> dict:
        validated_data = self._validate(init_data)
        user_data = json.loads(validated_data["user"])
        return {
            "tg_id": int(user_data["id"]),
            "username": user_data.get("username", ""),
            "first_name": user_data.get("first_name", ""),
            "avatar_url": user_data.get("photo_url", ""),
        }

    def _get_secret_key(self) -> bytes:
        return hmac.new(key=b"WebAppData", msg=self._bot_token.encode(), digestmod=hashlib.sha256).digest()

    def _validate(self, init_data: str) -> dict[str, Any]:
        try:
            parsed_data = dict(parse_qsl(init_data, strict_parsing=True))
        except ValueError as err:
            raise AuthError(detail="invalid init data") from err

        if "hash" not in parsed_data:
            raise AuthError(detail=f"missing hash {parsed_data}")
        hash_ = parsed_data.pop("hash")
        data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed_data.items(), key=itemgetter(0)))
        calculated_hash = hmac.new(
            key=self._secret_key,
            msg=data_check_string.encode(),
            digestmod=hashlib.sha256,
        ).hexdigest()
        if calculated_hash != hash_:
            raise AuthError(detail="invalid hash")
        return parsed_data

class LoginWidgetAuth:
    """Проверка данных Telegram Login Widget (сайт, не мини-апп).

    Схема подписи отличается от WebApp initData: секретный ключ —
    просто SHA256(bot_token), без HMAC-обёртки "WebAppData".
    https://core.telegram.org/widgets/login#checking-authorization
    """

    MAX_AGE_SECONDS = 86400

    def __init__(self, bot_token: str) -> None:
        self._secret_key = hashlib.sha256(bot_token.encode()).digest()

    def get_user_data(self, widget_data: dict) -> dict:
        data = {k: v for k, v in widget_data.items() if v is not None and k != 'hash'}
        received_hash = widget_data.get('hash', '')
        if not received_hash:
            raise AuthError(detail='missing hash')

        data_check_string = '\n'.join(
            f'{k}={v}' for k, v in sorted(data.items(), key=itemgetter(0))
        )
        calculated_hash = hmac.new(
            key=self._secret_key,
            msg=data_check_string.encode(),
            digestmod=hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(calculated_hash, received_hash):
            raise AuthError(detail='invalid hash')

        try:
            auth_date = int(data.get('auth_date', 0))
        except (TypeError, ValueError):
            raise AuthError(detail='invalid auth_date')
        if time.time() - auth_date > self.MAX_AGE_SECONDS:
            raise AuthError(detail='auth data expired')

        return {
            'tg_id': int(data['id']),
            'username': data.get('username', ''),
            'first_name': data.get('first_name', ''),
            'avatar_url': data.get('photo_url', ''),
        }


class TelegramLoginOidcAuth:
    """Вход через новый Telegram Login SDK (telegram-login.js?5).

    SDK возвращает OIDC id_token — JWT, подписанный Telegram. Проверяем
    подпись по JWKS с oauth.telegram.org, издателя и аудиторию (client_id
    из настроек Web Login мини-аппа в BotFather).
    https://core.telegram.org/widgets/login
    """

    ISSUER = 'https://oauth.telegram.org'
    DEFAULT_JWKS_URL = 'https://oauth.telegram.org/.well-known/jwks.json'
    ALLOWED_ALGORITHMS = ['RS256', 'ES256', 'EdDSA', 'ES256K']
    JWKS_CACHE_KEY = 'telegram_login:jwks'

    def __init__(self, client_ids, jwks_url=None, jwks_cache_seconds=3600):
        self._client_ids = [str(cid).strip() for cid in client_ids if str(cid or '').strip()]
        self._jwks_url = str(jwks_url or self.DEFAULT_JWKS_URL)
        self._jwks_cache_seconds = int(jwks_cache_seconds)

    def get_user_data(self, id_token: str) -> dict:
        payload = self._decode(id_token)
        telegram_user = payload.get('https://telegram.org/user') or {}
        if not isinstance(telegram_user, dict):
            telegram_user = {}

        telegram_id = telegram_user.get('id') or payload.get('id') or payload.get('sub')
        if telegram_id is None:
            raise AuthError(detail='telegram user id is missing')

        # Telegram кладёт имя в стандартный OIDC-claim "name".
        first_name = str(
            telegram_user.get('first_name') or payload.get('name') or payload.get('given_name') or ''
        ).strip()
        last_name = str(telegram_user.get('last_name') or payload.get('family_name') or '').strip()
        display_name = ' '.join(part for part in [first_name, last_name] if part).strip()
        username = str(telegram_user.get('username') or payload.get('preferred_username') or '').strip()
        photo_url = str(telegram_user.get('photo_url') or payload.get('picture') or '').strip()

        return {
            'tg_id': int(telegram_id),
            'username': username,
            'first_name': display_name or first_name or username,
            'avatar_url': photo_url,
        }

    def _decode(self, id_token: str) -> dict:
        token = str(id_token or '').strip()
        if not token:
            raise AuthError(detail='empty id_token')
        if not self._client_ids:
            raise AuthError(status=503, detail='telegram login client id is not configured')

        signing_key = self._get_signing_key(token)
        try:
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=self.ALLOWED_ALGORITHMS,
                issuer=self.ISSUER,
                # Аудиторию сверяем сами: PyJWT ждёт строку, а Telegram может
                # отдать aud числом (id бота) — это валило вход с ошибкой
                # «Invalid claim format in token».
                options={'require': ['exp', 'iss', 'sub'], 'verify_aud': False},
            )
        except InvalidTokenError as exc:
            raise AuthError(detail=f'invalid id_token: {exc}')

        aud = payload.get('aud')
        aud_values = aud if isinstance(aud, list) else [aud]
        aud_normalized = {str(value).strip() for value in aud_values if value is not None}
        if not aud_normalized & set(self._client_ids):
            raise AuthError(
                detail=f'audience mismatch: token={sorted(aud_normalized)}, configured={self._client_ids}',
            )
        return payload

    def _get_signing_key(self, id_token: str):
        try:
            header = jwt.get_unverified_header(id_token)
        except Exception as exc:
            raise AuthError(detail=f'invalid id_token header: {exc}')

        key_id = header.get('kid')
        for force_refresh in (False, True):
            jwks = self._fetch_jwks(force=force_refresh)
            for jwk_data in jwks.get('keys', []):
                if key_id and jwk_data.get('kid') != key_id:
                    continue
                return PyJWK.from_dict(jwk_data).key
        raise AuthError(detail='telegram signing key is not found')

    def _fetch_jwks(self, force=False) -> dict:
        if not force:
            cached = cache.get(self.JWKS_CACHE_KEY)
            if isinstance(cached, dict) and cached.get('keys'):
                return cached

        try:
            response = requests.get(self._jwks_url, timeout=(5, 15))
            response.raise_for_status()
            jwks = response.json()
        except Exception as exc:
            raise AuthError(status=503, detail=f'telegram jwks is unavailable: {exc}')

        if not isinstance(jwks, dict) or not jwks.get('keys'):
            raise AuthError(status=503, detail='telegram jwks is empty')
        cache.set(self.JWKS_CACHE_KEY, jwks, self._jwks_cache_seconds)
        return jwks
