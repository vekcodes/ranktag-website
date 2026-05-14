"""
Domain exceptions and a unified error envelope.

Every error response follows: {"error": {"code": str, "message": str, "details": ...}}
"""
from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger

log = get_logger(__name__)


class AppError(Exception):
    """Base class for predictable, user-facing application errors."""

    code: str = "app_error"
    status_code: int = status.HTTP_400_BAD_REQUEST

    def __init__(self, message: str, *, details: Any = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details


class NotFoundError(AppError):
    code = "not_found"
    status_code = status.HTTP_404_NOT_FOUND


class UnauthorizedError(AppError):
    code = "unauthorized"
    status_code = status.HTTP_401_UNAUTHORIZED


class ForbiddenError(AppError):
    code = "forbidden"
    status_code = status.HTTP_403_FORBIDDEN


class RateLimitedError(AppError):
    code = "rate_limited"
    status_code = status.HTTP_429_TOO_MANY_REQUESTS


class UpstreamError(AppError):
    code = "upstream_error"
    status_code = status.HTTP_502_BAD_GATEWAY


def _envelope(code: str, message: str, details: Any = None) -> dict:
    return {"error": {"code": code, "message": message, "details": details}}


def register_exception_handlers(app: FastAPI) -> None:
    """Wire global handlers — call from main."""

    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError) -> JSONResponse:
        log.warning("app.error", code=exc.code, message=exc.message)
        return JSONResponse(
            status_code=exc.status_code,
            content=_envelope(exc.code, exc.message, exc.details),
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=_envelope("http_error", str(exc.detail)),
        )

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=_envelope("validation_error", "Invalid request", exc.errors()),
        )

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception) -> JSONResponse:
        log.exception("app.unhandled", error=str(exc))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_envelope("internal_error", "An unexpected error occurred"),
        )
