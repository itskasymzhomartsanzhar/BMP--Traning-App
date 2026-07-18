import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from operator import itemgetter
from typing import Any
from urllib.parse import unquote, parse_qsl


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
