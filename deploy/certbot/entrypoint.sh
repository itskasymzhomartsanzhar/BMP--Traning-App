#!/bin/sh

DOMAIN="${DOMAIN:-tresfit.ru}"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

is_self_signed() {
    subject=$(openssl x509 -in "$CERT_DIR/fullchain.pem" -noout -subject 2>/dev/null)
    issuer=$(openssl x509 -in "$CERT_DIR/fullchain.pem" -noout -issuer 2>/dev/null)
    [ "${subject#subject=}" = "${issuer#issuer=}" ]
}

obtain() {
    echo "Выпускаем сертификат Let's Encrypt для $DOMAIN и www.$DOMAIN…"
    # Временный сертификат от nginx-entrypoint убираем, иначе certbot
    # создаст каталог-дубль tresfit.ru-0001.
    rm -rf "/etc/letsencrypt/live/$DOMAIN" "/etc/letsencrypt/archive/$DOMAIN" "/etc/letsencrypt/renewal/$DOMAIN.conf"

    certbot certonly --webroot -w /var/www/certbot \
        -d "$DOMAIN" -d "www.$DOMAIN" \
        --email "$CERTBOT_EMAIL" \
        --agree-tos --no-eff-email --non-interactive \
        || echo "ВНИМАНИЕ: выпуск не удался (проверьте DNS A-записи $DOMAIN и www.$DOMAIN). Повторим через час."
}

# Ждём, пока nginx поднимется и начнёт отвечать на ACME-челленджи.
sleep 5

trap exit TERM
while :; do
    if [ ! -f "$CERT_DIR/fullchain.pem" ] || is_self_signed; then
        # Реального сертификата ещё нет — пробуем выпустить; при неудаче
        # (например, DNS ещё не указывает на сервер) повторяем каждый час.
        obtain
        sleep 1h &
    else
        certbot renew --webroot -w /var/www/certbot --quiet
        sleep 12h &
    fi
    wait $!
done
