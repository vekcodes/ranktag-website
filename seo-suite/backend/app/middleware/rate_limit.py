"""
Redis-backed token-bucket rate limiter (skeleton).

Wired in only for the middleware surface — the actual bucket logic lands
in a later step when auth/quota stories are implemented.
"""
from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rpm: int, burst: int) -> None:  # type: ignore[no-untyped-def]
        super().__init__(app)
        self.rpm = rpm
        self.burst = burst

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        # NOTE: real implementation will key by (api_key|user_id|ip) and use
        # a Lua-scripted token bucket against the rate-limit Redis DB.
        return await call_next(request)
