FROM php:8.4-cli

RUN apt-get update \
    && apt-get install -y libzip-dev libpng-dev \
    && docker-php-ext-install pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
EXPOSE 8000

# Gera APP_KEY (se vazio), limpa cache e sobe o servidor de desenvolvimento.
CMD ["sh", "-c", "php artisan key:generate --force && php artisan config:clear && php artisan serve --host=0.0.0.0 --port=8000"]
