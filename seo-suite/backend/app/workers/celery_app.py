"""
Celery application factory.

Configured for late-ack, prefetch=1 (so long tasks don't starve siblings),
soft+hard time limits, retry with exponential backoff defaults.
"""
from __future__ import annotations

from celery import Celery
from celery.signals import worker_process_init, worker_process_shutdown

from app.config import get_settings
from app.core.logging import get_logger, setup_logging
from app.workers.beat_schedule import BEAT_SCHEDULE
from app.workers.queues import QUEUE_NAMES

log = get_logger(__name__)


def _make_celery() -> Celery:
    cfg = get_settings()
    setup_logging(level=cfg.log_level, json_format=cfg.log_json)

    app = Celery(
        "seo_suite",
        broker=cfg.celery_broker_url,
        backend=cfg.celery_result_backend,
        include=[
            "app.workers.crawler_tasks",
            "app.workers.metrics_tasks",
            "app.workers.aggregator_tasks",
            "app.workers.alert_tasks",
        ],
    )

    app.conf.update(
        task_default_queue="q.crawl.low",
        task_queues={name: {} for name in QUEUE_NAMES},
        task_acks_late=cfg.celery_task_acks_late,
        task_reject_on_worker_lost=True,
        task_time_limit=cfg.celery_task_time_limit,
        task_soft_time_limit=cfg.celery_task_soft_time_limit,
        worker_prefetch_multiplier=cfg.celery_worker_prefetch_multiplier,
        worker_max_tasks_per_child=1000,
        worker_send_task_events=True,
        task_send_sent_event=True,
        broker_connection_retry_on_startup=True,
        result_expires=3600,
        timezone="UTC",
        enable_utc=True,
        beat_schedule=BEAT_SCHEDULE,
    )

    return app


celery_app: Celery = _make_celery()


@worker_process_init.connect
def _init_worker(**_: object) -> None:
    log.info("celery.worker.init")


@worker_process_shutdown.connect
def _shutdown_worker(**_: object) -> None:
    log.info("celery.worker.shutdown")
