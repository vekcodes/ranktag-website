"""
Celery Beat periodic schedule.

Concrete schedules are added when each worker is implemented; this file
exists so `celery beat` boots without errors today.
"""
from __future__ import annotations

from celery.schedules import crontab

BEAT_SCHEDULE: dict = {
    # Example placeholder (commented):
    # "daily-new-lost-diff": {
    #     "task": "app.workers.aggregator_tasks.run_daily_diff",
    #     "schedule": crontab(hour=2, minute=0),
    #     "options": {"queue": "q.aggregate"},
    # },
}

__all__ = ["BEAT_SCHEDULE", "crontab"]
