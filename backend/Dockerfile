FROM php:8.4-apache-bookworm

ENV COMPOSER_ALLOW_SUPERUSER=1
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libicu-dev \
    libnss3 \
    libonig-dev \
    libpango-1.0-0 \
    libpq-dev \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    python3 \
    python3-pip \
    unzip \
    zip \
 && docker-php-ext-install bcmath pcntl pdo_mysql pdo_pgsql intl \
 && pecl install redis \
 && docker-php-ext-enable redis \
 && a2enmod rewrite headers \
 && sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf \
 && rm -rf /var/lib/apt/lists/*

RUN echo "post_max_size = 64M" >> /usr/local/etc/php/conf.d/docker-php-limits.ini \
 && echo "upload_max_filesize = 64M" >> /usr/local/etc/php/conf.d/docker-php-limits.ini \
 && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/docker-php-limits.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

COPY scraper-service/requirements.txt /tmp/requirements.txt
RUN pip3 install --break-system-packages --no-cache-dir -r /tmp/requirements.txt \
 && python3 -m playwright install --with-deps chromium

RUN python3 -c "import bs4, playwright, requests; print('Scraper runtime dependencies OK')"

COPY backend/ ./
COPY scraper-service/ /var/www/scraper-service/

RUN python3 -m compileall -q /var/www/scraper-service/app

RUN composer dump-autoload --optimize --no-dev

RUN rm -f bootstrap/cache/*.php
RUN php artisan package:discover --ansi

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache /var/www/scraper-service/output/logs \
 && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/scraper-service/output

RUN chmod +x /var/www/html/docker/entrypoint.sh
RUN chmod +x /var/www/html/docker/start-migrate.sh /var/www/html/docker/start-worker.sh /var/www/html/docker/start-ai-worker.sh /var/www/html/docker/start-scheduler.sh

ENTRYPOINT ["/var/www/html/docker/entrypoint.sh"]
EXPOSE 80
CMD ["apache2-foreground"]
