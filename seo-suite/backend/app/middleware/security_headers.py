"""Adds baseline security headers to every response."""
from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
        # CSP tuned for API JSON responses; tighten further at the edge for HTML.
        "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    }

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        response = await call_next(request)
        for k, v in self.HEADERS.items():
            response.headers.setdefault(k, v)
        return response
