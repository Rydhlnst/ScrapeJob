#!/usr/bin/env sh
set -eu

php artisan queue:work --queue=ai-cleanup --tries="${AI_QUEUE_TRIES:-3}" --timeout="${AI_QUEUE_TIMEOUT:-120}"
