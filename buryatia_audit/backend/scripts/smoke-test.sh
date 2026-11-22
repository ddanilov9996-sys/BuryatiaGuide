#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
node --check server.mjs
node server.mjs >/tmp/buryatiaguide-api-smoke.log 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true' EXIT
sleep 1
curl -fsS http://127.0.0.1:3000/api/health >/dev/null
curl -fsS http://127.0.0.1:3000/api/organizations >/dev/null
printf 'API smoke tests OK\n'
