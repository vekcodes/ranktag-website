"""URL canonicalization helpers (skeleton)."""
from __future__ import annotations


def canonicalize_url(_url: str) -> str:
    """Return the canonical form of a URL (implemented in later step)."""
    raise NotImplementedError


def url_hash(_url: str) -> str:
    """Stable hash of a canonical URL — primary key in link facts."""
    raise NotImplementedError
