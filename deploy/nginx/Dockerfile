# Стадия 1: сборка фронтенда (node ≥ 24 — требование @zxing/library)
FROM node:24-alpine AS frontend-build

WORKDIR /build

COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY frontend/ ./

# API на том же домене — относительный путь; client id Telegram-входа приходит аргументом.
ARG VITE_API_URL=/api
ARG VITE_TG_LOGIN_CLIENT_ID=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_TG_LOGIN_CLIENT_ID=$VITE_TG_LOGIN_CLIENT_ID

RUN yarn build

# Стадия 2: nginx
FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

COPY deploy/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY --from=frontend-build /build/dist /usr/share/nginx/html

ENTRYPOINT ["/entrypoint.sh"]
