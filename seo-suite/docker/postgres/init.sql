-- ─────────────────────────────────────────────────────────────────────
--  PostgreSQL bootstrap — runs ONCE on first container boot.
--
--  Owns:
--    - extensions
--    - roles (admin / app / readonly / replicator)
--    - grants
--    - pg_stat_statements + pg_trgm tuning
--
--  Schema migrations are Alembic's job, NOT this file.
-- ─────────────────────────────────────────────────────────────────────

-- ── Extensions ──
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ── Roles ──────────────────────────────────────────────────────────────
-- POSTGRES_USER (default "seosuite") is the bootstrap superuser inside
-- the container. We carve out application-specific roles below and use
-- those from the app / workers / read-only users.
--
-- In production these passwords come from Vault / K8s secrets — the
-- values below are dev defaults only.

DO $$
BEGIN
  -- Application role: full DML on application schemas.
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'seosuite_app') THEN
    CREATE ROLE seosuite_app LOGIN PASSWORD 'seosuite_app_dev_pw'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;

  -- Read-only role: SELECT only — used by analytics workers + dashboard.
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'seosuite_ro') THEN
    CREATE ROLE seosuite_ro LOGIN PASSWORD 'seosuite_ro_dev_pw'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;

  -- Migrator role: DDL + DML; used by Alembic only.
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'seosuite_migrator') THEN
    CREATE ROLE seosuite_migrator LOGIN PASSWORD 'seosuite_migrator_dev_pw'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;

  -- Replicator: WAL streaming for standby + DR.
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'seosuite_replicator') THEN
    CREATE ROLE seosuite_replicator LOGIN REPLICATION
      PASSWORD 'seosuite_replicator_dev_pw';
  END IF;
END $$;

-- ── Database ownership + schema ────────────────────────────────────────
-- POSTGRES_DB ("seosuite") already exists at this point; we create the
-- app schema explicitly so we can grant on it without worrying about
-- the default `public` permissions in PG 15+.

CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION seosuite_migrator;

-- ── Default privileges ─────────────────────────────────────────────────
-- Anything the migrator creates from now on is usable by `app` and
-- readable by `ro` without needing further grants per migration.

ALTER DEFAULT PRIVILEGES FOR ROLE seosuite_migrator IN SCHEMA app
  GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER ON TABLES TO seosuite_app;
ALTER DEFAULT PRIVILEGES FOR ROLE seosuite_migrator IN SCHEMA app
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO seosuite_app;
ALTER DEFAULT PRIVILEGES FOR ROLE seosuite_migrator IN SCHEMA app
  GRANT EXECUTE ON FUNCTIONS TO seosuite_app;

ALTER DEFAULT PRIVILEGES FOR ROLE seosuite_migrator IN SCHEMA app
  GRANT SELECT ON TABLES TO seosuite_ro;
ALTER DEFAULT PRIVILEGES FOR ROLE seosuite_migrator IN SCHEMA app
  GRANT USAGE, SELECT ON SEQUENCES TO seosuite_ro;

GRANT USAGE ON SCHEMA app TO seosuite_app, seosuite_ro;
GRANT CREATE, USAGE ON SCHEMA app TO seosuite_migrator;

-- ── pg_stat_statements ────────────────────────────────────────────────
-- Already enabled via shared_preload_libraries (see postgresql.conf).
-- Reset stats periodically from a maintenance job; not here.

GRANT SELECT ON pg_stat_statements TO seosuite_ro;

-- ── search_path for app role ──────────────────────────────────────────
ALTER ROLE seosuite_app       SET search_path = app, public;
ALTER ROLE seosuite_ro        SET search_path = app, public;
ALTER ROLE seosuite_migrator  SET search_path = app, public;

-- ── Connection limits (defense-in-depth; PgBouncer is the real limit) ──
ALTER ROLE seosuite_app  CONNECTION LIMIT 200;
ALTER ROLE seosuite_ro   CONNECTION LIMIT 100;
ALTER ROLE seosuite_migrator CONNECTION LIMIT 5;

-- ── Statement timeouts (per-role; overridable per-session) ────────────
ALTER ROLE seosuite_app       SET statement_timeout = '30s';
ALTER ROLE seosuite_ro        SET statement_timeout = '120s';     -- analytics
ALTER ROLE seosuite_migrator  SET statement_timeout = '0';         -- no limit
ALTER ROLE seosuite_app       SET idle_in_transaction_session_timeout = '60s';
ALTER ROLE seosuite_ro        SET idle_in_transaction_session_timeout = '30s';

-- ── pg_trgm similarity threshold tuning ────────────────────────────────
-- Lower threshold = more matches but slower. 0.25 is a good default for
-- domain/anchor fuzzy search.
ALTER DATABASE seosuite SET pg_trgm.similarity_threshold = 0.25;
