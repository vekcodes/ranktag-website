"""
Centralised structured logging configuration.

Uses structlog so every log line is a key-value record. In development it
renders coloured console output; in production it emits one JSON object per
line for log shippers.
"""
from __future__ import annotations

import logging
import sys

import structlog


def setup_logging(level: str = "INFO", json_format: bool = False) -> None:
    """Configure stdlib + structlog. Idempotent."""
    log_level = getattr(logging, level.upper(), logging.INFO)

    shared_processors: list = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    renderer = (
        structlog.processors.JSONRenderer()
        if json_format
        else structlog.dev.ConsoleRenderer(colors=True)
    )

    structlog.configure(
        processors=[*shared_processors, renderer],
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Route stdlib logging through the same handler.
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(log_level)

    # Quiet down chatty libraries.
    for noisy in ("uvicorn.access", "asyncio", "botocore", "urllib3"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    """Return a bound structlog logger."""
    return structlog.get_logger(name)
