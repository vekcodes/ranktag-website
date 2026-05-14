"""
Security primitives placeholder.

JWT issue/verify, password hashing helpers, and API-key validation
will live here. No implementation yet — only the module surface.
"""
from __future__ import annotations


def hash_password(_plain: str) -> str:
    """Hash a plaintext password with bcrypt (implemented in later step)."""
    raise NotImplementedError


def verify_password(_plain: str, _hashed: str) -> bool:
    """Verify a password against a stored hash (implemented in later step)."""
    raise NotImplementedError


def issue_access_token(_subject: str) -> str:
    """Issue a signed JWT access token (implemented in later step)."""
    raise NotImplementedError


def decode_token(_token: str) -> dict:
    """Decode + verify a JWT (implemented in later step)."""
    raise NotImplementedError
