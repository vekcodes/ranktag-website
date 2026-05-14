# Convenience wrappers — run from seo-suite/
.PHONY: help up down logs ps rebuild migrate revision shell-api shell-worker test lint format fe-dev be-dev worker beat

help:
	@echo "Targets:"
	@echo "  up           docker compose up (build + detached)"
	@echo "  down         docker compose down"
	@echo "  logs s=api   tail logs for one service"
	@echo "  ps           list running services"
	@echo "  rebuild s=api rebuild a single service"
	@echo "  migrate      alembic upgrade head"
	@echo "  revision m=  alembic revision --autogenerate -m \"...\""
	@echo "  shell-api    bash into api container"
	@echo "  shell-worker bash into worker container"
	@echo "  test         pytest backend"
	@echo "  lint         ruff check + mypy"
	@echo "  format       ruff format"
	@echo "  fe-dev       run frontend dev outside docker"
	@echo "  be-dev       run backend dev outside docker"

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f $(s)

ps:
	docker compose ps

rebuild:
	docker compose build $(s) && docker compose up -d $(s)

migrate:
	docker compose exec api alembic -c alembic.ini upgrade head

revision:
	docker compose exec api alembic -c alembic.ini revision -m "$(m)" --autogenerate

shell-api:
	docker compose exec api bash

shell-worker:
	docker compose exec worker bash

test:
	docker compose exec api pytest tests -v

lint:
	docker compose exec api ruff check .
	docker compose exec api mypy app

format:
	docker compose exec api ruff format .

fe-dev:
	cd frontend && npm install && npm run dev

be-dev:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

worker:
	cd backend && celery -A app.workers.celery_app:celery_app worker -l info

beat:
	cd backend && celery -A app.workers.celery_app:celery_app beat -l info
