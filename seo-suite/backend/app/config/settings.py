"""
Application settings.

Single source of truth for environment-driven configuration. All modules
import `get_settings()` (cached) rather than reading os.environ directly.
"""
from __future__ import annotations

from enum import Enum
from functools import lru_cache

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppEnv(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """Strongly-typed env-backed settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──
    app_name: str = "seo-suite"
    app_env: AppEnv = AppEnv.DEVELOPMENT
    app_version: str = "0.1.0"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    app_debug: bool = False
    app_secret_key: str = "change-me"
    app_base_url: str = "http://localhost:8000"
    app_public_url: str = "http://localhost:3000"

    # ── Logging ──
    log_level: str = "INFO"
    log_json: bool = False
    log_request_body: bool = False

    # ── CORS / security ──
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    trusted_hosts: list[str] = Field(default_factory=lambda: ["*"])
    session_cookie_secure: bool = False

    # ── Auth ──
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_access_ttl_min: int = 30
    jwt_refresh_ttl_days: int = 14

    # ── Postgres ──
    # Primary (writes + RYW reads). In dev points at the bare Postgres; in
    # prod point at PgBouncer's transaction pool (port 6432).
    database_url: str = "postgresql+asyncpg://seosuite_app:seosuite_app_dev_pw@postgres:5432/seosuite"

    # Sync DSN — Alembic uses psycopg2 for migrations.
    database_url_sync: str = "postgresql+psycopg2://seosuite_migrator:seosuite_migrator_dev_pw@postgres:5432/seosuite"

    # Read replica DSN. Defaults to primary in dev; in prod set to replica.
    database_url_replica: str | None = None

    # Analytics DSN (typically a long-running replica or a separate node).
    # Falls back to replica → primary if unset.
    database_url_analytics: str | None = None

    # Connection pool — SQLAlchemy side. PgBouncer is the real ceiling.
    database_pool_size: int = 10
    database_max_overflow: int = 20
    database_pool_timeout: int = 30
    database_pool_recycle: int = 1800           # recycle conns every 30 min
    database_pool_pre_ping: bool = True
    database_echo: bool = False
    database_statement_timeout_ms: int = 30_000
    database_command_timeout_s: int = 30

    # ── ClickHouse ──
    clickhouse_host: str = "clickhouse"
    clickhouse_port: int = 8123
    clickhouse_db: str = "seosuite"
    clickhouse_user: str = "default"
    clickhouse_password: str = ""

    # ── Redis ──
    redis_url: str = "redis://redis:6379/0"
    redis_cache_db: int = 1
    redis_rate_limit_db: int = 2
    redis_frontier_db: int = 3
    redis_max_connections: int = 100

    # ── Celery ──
    celery_broker_url: str = "redis://redis:6379/0"
    celery_result_backend: str = "redis://redis:6379/4"
    celery_task_time_limit: int = 600
    celery_task_soft_time_limit: int = 540
    celery_worker_prefetch_multiplier: int = 1
    celery_task_acks_late: bool = True

    # ── Object storage ──
    s3_endpoint: str | None = None
    s3_region: str = "us-east-1"
    s3_bucket: str = "seo-suite-artifacts"
    s3_access_key: str | None = None
    s3_secret_key: str | None = None
    s3_use_ssl: bool = True

    # ── Crawler ──
    crawler_user_agent: str = "SeoSuiteBot/0.1"
    crawler_max_concurrency: int = 64
    crawler_per_host_concurrency: int = 2
    crawler_request_timeout: int = 20
    crawler_max_retries: int = 3
    crawler_retry_backoff: float = 1.5
    crawler_respect_robots: bool = True
    crawler_default_delay_ms: int = 500
    crawler_max_page_size_mb: int = 10
    playwright_headless: bool = True
    playwright_browsers_path: str = "/ms-playwright"

    # ── External SEO APIs ──
    dataforseo_login: str | None = None
    dataforseo_password: str | None = None
    serpstat_api_key: str | None = None
    majestic_api_key: str | None = None
    commoncrawl_index: str | None = None

    # ── Rate limiting ──
    rate_limit_rpm: int = 120
    rate_limit_burst: int = 20
    rate_limit_anon_rpm: int = 10

    # ── Observability ──
    sentry_dsn: str | None = None
    otel_exporter_otlp_endpoint: str | None = None
    prometheus_enabled: bool = True

    # ── Feature flags ──
    feature_render_js: bool = True
    feature_toxic_score: bool = True
    feature_history_tracking: bool = True

    # ── Computed helpers ──
    @computed_field  # type: ignore[misc]
    @property
    def is_production(self) -> bool:
        return self.app_env == AppEnv.PRODUCTION

    @computed_field  # type: ignore[misc]
    @property
    def is_development(self) -> bool:
        return self.app_env == AppEnv.DEVELOPMENT


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings accessor — call this everywhere."""
    return Settings()
