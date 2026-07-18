# Стадия 1: сборка фронтенда
FROM node:22-alpine AS frontend-build

WORKDIR /build

COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY frontend/ ./

# API на том же домене — относительный путь; username бота приходит аргументом.
ARG VITE_API_URL=/api
ARG VITE_TG_BOT_USERNAME=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_TG_BOT_USERNAME=$VITE_TG_BOT_USERNAME

RUN yarn build

# Стадия 2: nginx
FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

COPY deploy/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY --from=frontend-build /build/dist /usr/share/nginx/html

ENTRYPOINT ["/entrypoint.sh"]
