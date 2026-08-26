#!/usr/bin/env sh
set -eu

php artisan migrate --force
php artisan db:seed --force

if [ "${SCRAPER_RUN_ON_STARTUP:-true}" = "true" ]; then
  echo "Dispatching initial scrape for all active sources..."
  php artisan jobs:scrape --queue
else
  echo "Initial scrape disabled by SCRAPER_RUN_ON_STARTUP."
fi
