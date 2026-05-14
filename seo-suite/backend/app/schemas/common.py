"""Cross-cutting Pydantic models — error envelope, pagination, health."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    """Base for all DTOs — forbids extra fields, validates assignment."""

    model_config = ConfigDict(extra="forbid", validate_assignment=True, frozen=False)


class ErrorBody(StrictModel):
    code: str
    message: str
    details: Any | None = None


class ErrorEnvelope(StrictModel):
    error: ErrorBody


class PageMeta(StrictModel):
    next_cursor: str | None = None
    has_more: bool = False
    total: int | None = None


class HealthResponse(StrictModel):
    status: str = Field(examples=["ok"])
    env: str
    version: str
    uptime_seconds: int
    dependencies: dict[str, bool] = Field(default_factory=dict)
