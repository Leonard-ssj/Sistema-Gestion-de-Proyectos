#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"
python bootstrap_db.py || echo "Bootstrap DB omitido (se reintentará al iniciar gunicorn)"

WORKERS="${WEB_CONCURRENCY:-1}"
THREADS="${GUNICORN_THREADS:-8}"

exec gunicorn \
  --bind 0.0.0.0:"${PORT}" \
  --worker-class gthread \
  --workers "${WORKERS}" \
  --threads "${THREADS}" \
  --timeout 0 \
  --keep-alive 75 \
  --access-logfile - \
  --error-logfile - \
  wsgi:app
