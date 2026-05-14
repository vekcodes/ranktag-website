"""Adds X-Process-Time header and logs slow requests."""
from __future__ import annotations

import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import get_logger

log = get_logger(__name__)


class TimingMiddleware(BaseHTTPMiddleware):
    SLOW_MS = 1000

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        t0 = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - t0) * 1000
        response.headers["X-Process-Time"] = f"{elapsed_ms:.1f}ms"
        if elapsed_ms > self.SLOW_MS:
            log.warning("request.slow", path=request.url.path, elapsed_ms=round(elapsed_ms))
        return response
