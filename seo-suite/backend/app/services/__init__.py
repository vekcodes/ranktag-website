"""
Service layer — orchestration between API and infra.

Each domain gets one service module (reports_service, metrics_service,
crawl_service, aggregation_service, ...). Services are the *only* place
that combine repositories, crawlers, cache, and queue calls. They
never import FastAPI primitives.
"""
