"""
Health endpoints.

`/api/v1/health`       — liveness, cheap, used by LB.
`/api/v1/health/deep`  — readiness, includes dependency probes.
"""
from __future__ import annotations

import time

from fastapi import APIRouter
from sqlalchemy import text

from app.api.deps import SettingsDep
from app.cache.redis_client import get_redis
from app.database.session import AsyncSessionLocal
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])

_PROCESS_START = time.time()


@router.get("/health", response_model=HealthResponse, summary="Liveness probe")
async def health(settings: SettingsDep) -> HealthResponse:
    return HealthResponse(
        status="ok",
        env=settings.app_env.value,
        version=settings.app_version,
        uptime_seconds=int(time.time() - _PROCESS_START),
    )


@router.get("/health/deep", response_model=HealthResponse, summary="Readiness probe")
async def health_deep(settings: SettingsDep) -> HealthResponse:
    deps: dict[str, bool] = {}

    # Postgres
    try:
        if AsyncSessionLocal is None:
            deps["postgres"] = False
        else:
            async with AsyncSessionLocal() as s:
                await s.execute(text("SELECT 1"))
                deps["postgres"] = True
    except Exception:
        deps["postgres"] = False

    # Redis
    try:
        r = get_redis()
        await r.ping()
        deps["redis"] = True
    except Exception:
        deps["redis"] = False

    return HealthResponse(
        status="ok" if all(deps.values()) else "degraded",
        env=settings.app_env.value,
        version=settings.app_version,
        uptime_seconds=int(time.time() - _PROCESS_START),
        dependencies=deps,
    )
