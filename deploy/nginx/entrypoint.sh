#!/bin/sh
set -e

CERT_DIR=/etc/letsencrypt/live/tresfit.ru

# Первый запуск: реального сертификата ещё нет, а nginx без файла не стартует.
# Кладём временный самоподписанный — certbot заменит его настоящим.
if [ ! -f "$CERT_DIR/fullchain.pem" ]; then
    echo "Сертификата нет — генерируем временный самоподписанный."
    mkdir -p "$CERT_DIR"
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/CN=tresfit.ru" >/dev/null 2>&1
fi

# Следим за сертификатом: certbot выпустил/продлил → перечитываем конфиг.
# Сравниваем по mtime раз в 30 секунд — reload у nginx без даунтайма.
( last=$(stat -c %Y "$CERT_DIR/fullchain.pem" 2>/dev/null || echo 0)
  while :; do
    sleep 30
    now=$(stat -c %Y "$CERT_DIR/fullchain.pem" 2>/dev/null || echo 0)
    if [ "$now" != "$last" ]; then
        last=$now
        echo "Сертификат обновился — перечитываем nginx."
        nginx -s reload 2>/dev/null || true
    fi
done ) &

exec nginx -g "daemon off;"
