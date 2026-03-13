#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"
python bootstrap_db.py
exec gunicorn --bind 0.0.0.0:"${PORT}" wsgi:app
