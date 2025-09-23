#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Uvicorn..."
exec uvicorn asgi:application --host 0.0.0.0 --port 8000 --proxy-headers
