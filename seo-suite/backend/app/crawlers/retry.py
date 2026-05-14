"""
Retry policy presets for crawler stages.

Uses tenacity. Concrete policies (per-stage) are exported as decorators;
each stage imports the one it needs.
"""
from __future__ import annotations

from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential_jitter,
)

DEFAULT_MAX_ATTEMPTS = 4


def with_default_retry(exc_types: tuple[type[Exception], ...] = (Exception,)):
    """Reusable retry decorator with exponential backoff + jitter."""
    return retry(
        reraise=True,
        retry=retry_if_exception_type(exc_types),
        stop=stop_after_attempt(DEFAULT_MAX_ATTEMPTS),
        wait=wait_exponential_jitter(initial=1, max=30),
    )
