"""
Aggregated v1 router.

Each feature contributes a router; this file is the only place we wire
them in. Keeping aggregation here means feature modules stay decoupled.
"""
from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import health

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)

# Future routers (placeholders — added in later steps):
# api_router.include_router(auth.router)
# api_router.include_router(domains.router)
# api_router.include_router(reports.router)
# api_router.include_router(backlinks.router)
# api_router.include_router(referring_domains.router)
# api_router.include_router(anchors.router)
# api_router.include_router(outlinks.router)
# api_router.include_router(watchlists.router)
# api_router.include_router(exports.router)
# api_router.include_router(jobs.router)
