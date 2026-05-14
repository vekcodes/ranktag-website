"""Crawler-related Celery tasks (placeholder)."""
from __future__ import annotations

from app.workers.celery_app import celery_app

# Tasks land in later steps. Example signature kept here for grep-ability:
#
# @celery_app.task(
#     bind=True,
#     name="crawler.crawl_target",
#     queue="q.crawl.high",
#     autoretry_for=(Exception,),
#     retry_backoff=True,
#     retry_backoff_max=300,
#     retry_jitter=True,
#     max_retries=5,
# )
# def crawl_target(self, domain: str) -> None: ...
_ = celery_app  # keep the import live so this module registers
