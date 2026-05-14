"""Shared pytest fixtures."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture(scope="session")
def app():
    return create_app()


@pytest.fixture()
def client(app) -> TestClient:
    return TestClient(app)
