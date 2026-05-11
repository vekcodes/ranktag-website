"""
RankedTag Keyword Density Analyzer — FastAPI application.

This is the core backend engine. Frontend, auth, and deployment are
added in later modules.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analyze import router as analyze_router
from app.routes.analyze_url import router as analyze_url_router
from app.routes.analyze_advanced import router as analyze_advanced_router
from app.routes.session import router as session_router
from app.routes.score import router as score_router
from app.routes.export import router as export_router
from app.routes.competitor import router as competitor_router

app = FastAPI(
    title="RankedTag Keyword Density Analyzer",
    version="7.0.0",
    description="Professional SEO keyword density analysis engine with competitor analysis.",
)

# Permissive CORS for local dev; tighten in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS", "DELETE"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(analyze_url_router)
app.include_router(analyze_advanced_router)
app.include_router(session_router)
app.include_router(score_router)
app.include_router(export_router)
app.include_router(competitor_router)


@app.get("/health")
def health() -> dict:
    from app.services.cache_service import get_global_cache
    from app.services.session_service import active_session_count

    return {
        "status": "ok",
        "engine": "rankedtag-keyword-density-v7",
        "capabilities": [
            "text-analysis",
            "url-crawling",
            "lemmatization",
            "stemming",
            "keyword-grouping",
            "contextual-analysis",
            "prominence-scoring",
            "realtime-sessions",
            "incremental-analysis",
        ],
        "sessions": {
            "active": active_session_count(),
            "cache": get_global_cache().stats(),
        },
    }
