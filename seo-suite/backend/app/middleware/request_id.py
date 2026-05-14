"""
Inject a request-id into every request's logging context.

The ID flows through structlog (via contextvars) so every log line tied
to a request is searchable by `request_id`.
"""
from __future__ import annotations

import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RequestIdMiddleware(BaseHTTPMiddleware):
    HEADER = "X-Request-ID"

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        request_id = request.headers.get(self.HEADER) or uuid.uuid4().hex
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)
        response = await call_next(request)
        response.headers[self.HEADER] = request_id
        return response
