FROM python:3.13-slim AS base

# System deps for lxml, reportlab
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libxml2-dev libxslt1-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    python -m spacy download en_core_web_sm

# Copy application code
COPY . .

# Pre-download NLTK data
RUN python -c "import nltk; nltk.download('stopwords', quiet=True)"

EXPOSE 8000

# Production: gunicorn with uvicorn workers
CMD ["gunicorn", "-c", "gunicorn.conf.py", "app.main:app"]
