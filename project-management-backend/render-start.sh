#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"
python -m flask --app wsgi:app db upgrade
exec gunicorn --bind 0.0.0.0:"${PORT}" wsgi:app
