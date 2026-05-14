"""
Reusable FastAPI dependencies (DI).

Keep this module free of business logic — only wiring.
"""
from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.database.session import get_async_session

SettingsDep = Annotated[Settings, Depends(get_settings)]
DBSession = Annotated[AsyncSession, Depends(get_async_session)]
