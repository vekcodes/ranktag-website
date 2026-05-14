# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────
#  Backend image — FastAPI API + shared base for workers
# ─────────────────────────────────────────────

# 1) Base ─ slim Python, system deps for psycopg2/lxml/Playwright
FROM python:3.12-slim-bookworm AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        ca-certificates \
        libpq-dev \
        libxml2-dev libxslt1-dev \
        netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2) Deps layer (cached on requirements.txt only)
COPY requirements.txt requirements-dev.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# 3) App
COPY . /app

RUN chmod +x scripts/*.sh

EXPOSE 8000

# Default = API. Override CMD for worker / beat images.
CMD ["./scripts/start-api.sh"]
