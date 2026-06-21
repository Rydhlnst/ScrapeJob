#!/usr/bin/env sh
set -eu

php artisan queue:work --queue=default,ai-cleanup --tries="${QUEUE_TRIES:-3}" --timeout="${QUEUE_TIMEOUT:-900}"
