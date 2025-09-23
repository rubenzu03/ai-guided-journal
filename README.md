# Your AI guided journal

Ever felt like needing someone to tell you more about your day? Thanks to Google's new Gemini 2.5 Flash model, you'll receive an analysis based on what you have done for the day!

<img src="https://img.shields.io/badge/-Python-3776AB?logo=Python&logoColor=white"/> <img src="https://img.shields.io/badge/-Django-092E20?logo=django&logoColor=white"/>

## Run with Docker (quick local test)

1. Copy `.env.example` to `.env` and adjust `SECRET_KEY', 'GEMINI_API_KEY' and `ALLOWED_HOSTS.

2. Build and start with docker-compose:

```sh
docker compose build --progress=plain
docker compose up
```

The app will be available at http://localhost:8000. This setup uses Uvicorn directly (no Gunicorn) to run the ASGI app.

To stop and remove containers:

```sh
docker compose down
```
