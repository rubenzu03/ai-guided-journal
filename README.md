# Your AI guided journal

Ever felt like needing someone to tell you more about your day? Thanks to Google's new Gemini 2.5 Flash model, you'll receive an analysis based on what you have done for the day!

<img src="https://img.shields.io/badge/-Python-3776AB?logo=Python&logoColor=white"/> <img src="https://img.shields.io/badge/-Django-092E20?logo=django&logoColor=white"/>

## Run with Docker

1. Copy `.env.example` to `.env` and adjust `SECRET_KEY'`, `'GEMINI_API_KEY'` and `ALLOWED_HOSTS`.

2. Build and start with docker-compose:

```sh
docker compose build --progress=plain
docker compose up
```

The app will be available at http://localhost:8000

To stop and remove containers:

```sh
docker compose down
```

## Screenshots
### Main page
<img width="1707" height="880" alt="Main page" src="https://github.com/user-attachments/assets/b97df8ce-7f61-4c84-a3b8-b5bd69ad23dc" />
### Entries page
<img width="1707" height="880" alt="Entries page" src="https://github.com/user-attachments/assets/1026968a-1d18-4321-89bc-a68a7138c6f0" />
### Login
<img width="1707" height="880" alt="Login" src="https://github.com/user-attachments/assets/91147c80-dc0d-4ad8-a6b5-8c038251a260" />
