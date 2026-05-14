"""
FastAPI application factory.

Owns: app construction, middleware install, exception handlers, router
mount, lifespan. No business logic.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api.v1.router import api_router
from app.config import Settings, get_settings
from app.core.exceptions import register_exception_handlers
from app.core.lifecycle import lifespan
from app.core.logging import setup_logging
from app.middleware import install_middleware


def create_app(settings: Settings | None = None) -> FastAPI:
    cfg = settings or get_settings()

    setup_logging(level=cfg.log_level, json_format=cfg.log_json)

    app = FastAPI(
        title="SEO Suite API",
        version=cfg.app_version,
        description="Domain Authority + Backlink Checker — REST API.",
        docs_url=None if cfg.is_production else "/docs",
        redoc_url=None if cfg.is_production else "/redoc",
        openapi_url=None if cfg.is_production else "/openapi.json",
        lifespan=lifespan,
    )

    # ── Outermost: trusted host, then CORS ──
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=cfg.trusted_hosts)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cfg.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Process-Time"],
    )

    install_middleware(app, cfg)
    register_exception_handlers(app)

    app.include_router(api_router)

    # Top-level liveness (LB-friendly, no /api/v1 prefix)
    @app.get("/healthz", include_in_schema=False)
    async def healthz() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
