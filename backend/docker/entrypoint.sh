#!/usr/bin/env sh
set -eu

require_env() {
  var_name="$1"
  eval "var_value=\${$var_name:-}"

  if [ -z "$var_value" ]; then
    echo "Missing required environment variable: $var_name" >&2
    exit 1
  fi
}

wait_for_database() {
  if [ "${WAIT_FOR_DB:-true}" != "true" ]; then
    return 0
  fi

  if [ -z "${DB_HOST:-}" ] || [ -z "${DB_PORT:-}" ] || [ -z "${DB_DATABASE:-}" ] || [ -z "${DB_USERNAME:-}" ]; then
    return 0
  fi

  retries="${DB_WAIT_RETRIES:-30}"
  sleep_seconds="${DB_WAIT_SLEEP_SECONDS:-2}"
  attempt=1

  while [ "$attempt" -le "$retries" ]; do
    if php -r '
      $driver = getenv("DB_CONNECTION") ?: "pgsql";
      $host = getenv("DB_HOST") ?: "127.0.0.1";
      $port = getenv("DB_PORT") ?: ($driver === "pgsql" ? "5432" : "3306");
      $database = getenv("DB_DATABASE") ?: "";
      $username = getenv("DB_USERNAME") ?: "";
      $password = getenv("DB_PASSWORD") ?: "";
      $dsn = $driver === "pgsql"
          ? "pgsql:host={$host};port={$port};dbname={$database}"
          : "mysql:host={$host};port={$port};dbname={$database}";

      try {
          new PDO($dsn, $username, $password, [PDO::ATTR_TIMEOUT => 5]);
          exit(0);
      } catch (Throwable $e) {
          fwrite(STDERR, $e->getMessage() . PHP_EOL);
          exit(1);
      }
    '; then
      return 0
    fi

    echo "Waiting for database connection (${attempt}/${retries})..."
    sleep "$sleep_seconds"
    attempt=$((attempt + 1))
  done

  echo "Database is not reachable after ${retries} attempts." >&2
  exit 1
}

if [ -f "/var/www/html/.env.docker" ] && [ ! -f "/var/www/html/.env" ]; then
  cp /var/www/html/.env.docker /var/www/html/.env
fi

if [ "${APP_ENV:-production}" = "production" ]; then
  require_env APP_KEY
  require_env APP_URL
  require_env FRONTEND_URL
  require_env DB_CONNECTION
  require_env DB_HOST
  require_env DB_PORT
  require_env DB_DATABASE
  require_env DB_USERNAME
  require_env DB_PASSWORD
  require_env REDIS_HOST

  if [ "${APP_DEBUG:-false}" != "false" ]; then
    echo "APP_DEBUG must be false in production." >&2
    exit 1
  fi
elif [ -z "${APP_KEY:-}" ]; then
  export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
  echo "Generated runtime APP_KEY because APP_KEY was empty."
fi

mkdir -p storage/logs bootstrap/cache /var/www/scraper-service/output/logs
chmod -R 775 storage bootstrap/cache /var/www/scraper-service/output || true
chown -R www-data:www-data storage bootstrap/cache /var/www/scraper-service/output || true

wait_for_database

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  php artisan migrate --force
fi

if [ "${APP_ENV:-production}" = "production" ] && [ "${ENABLE_LARAVEL_CACHE_WARMUP:-true}" = "true" ]; then
  rm -f bootstrap/cache/*.php
  php artisan config:cache
  php artisan route:cache
fi

exec "$@"
