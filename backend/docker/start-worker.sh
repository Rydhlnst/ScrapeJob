#!/usr/bin/env sh
set -eu

worker_count="${QUEUE_WORKERS:-3}"
tries="${QUEUE_TRIES:-3}"
timeout="${QUEUE_TIMEOUT:-720}"
pids=""

stop_workers() {
  for pid in $pids; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}

trap stop_workers TERM INT

i=1
while [ "$i" -le "$worker_count" ]; do
  php artisan queue:work --queue=default --tries="$tries" --timeout="$timeout" &
  pids="$pids $!"
  i=$((i + 1))
done

status=0
for pid in $pids; do
  wait "$pid" || status=1
done

exit "$status"
