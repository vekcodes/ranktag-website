"""HTTP middleware: request_id, timing, security headers, rate limit."""
from fastapi import FastAPI

from app.config import Settings, get_settings
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.timing import TimingMiddleware


def install_middleware(app: FastAPI, settings: Settings | None = None) -> None:
    """Install the middleware stack in correct order (outer → inner)."""
    cfg = settings or get_settings()

    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(TimingMiddleware)
    app.add_middleware(RateLimitMiddleware, rpm=cfg.rate_limit_rpm, burst=cfg.rate_limit_burst)
    app.add_middleware(RequestIdMiddleware)


__all__ = ["install_middleware"]
