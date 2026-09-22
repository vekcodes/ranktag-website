// Neon serverless Postgres client (HTTP — safe for Vercel functions, no pooling).
import { neon } from '@neondatabase/serverless';
import { VISIBLE_SCHEDULED, VISIBLE_LEGACY } from './blog.js';

const CONN =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  '';

let _sql = null;

/** Tagged-template SQL client. Throws a clear error if the DB isn't wired yet. */
export function db() {
  if (!CONN) {
    const e = new Error(
      'Database not configured. Set DATABASE_URL (Neon) in Vercel env vars and run `vercel env pull .env.local`.'
    );
    e.status = 503;
    throw e;
  }
  if (!_sql) _sql = neon(CONN);
  return _sql;
}

export function dbConfigured() {
  return Boolean(CONN);
}

// ── Scheduled publishing: schema capability probe ────────────────────────
//
// Scheduling needs a `publish_at` column. If the code is ever deployed ahead
// of the migration — or the migration is rolled back — every public query
// would reference a column that does not exist, Postgres would error, and the
// route handlers would turn that into "no posts". The blog would silently go
// blank while every row sat safely in the database. That happened once; this
// makes it impossible.
//
// So the condition is chosen at runtime from what the schema actually has.
// The probe runs once per warm function instance and is cached, so it costs
// one cheap catalogue lookup on a cold start and nothing thereafter.
// `true` is cached forever — a column does not disappear. `false` is cached
// only briefly, so that running the migration against a live site takes effect
// within a minute rather than waiting for every warm instance to recycle.
let _hasPublishAt = null;
let _probedAt = 0;
const NEGATIVE_TTL_MS = 60_000;

/**
 * The WHERE clause every public query should use, as a raw SQL fragment ready
 * to embed in a tagged template via sql.unsafe().
 *
 *  - column present -> scheduled posts appear the minute they are due
 *  - column absent  -> exactly the pre-scheduling behaviour, blog stays up
 *
 * Any failure to probe is treated as "absent", because degrading to the old
 * behaviour is always safe and erroring never is.
 */
export async function visibleWhere(sql) {
  const stale =
    _hasPublishAt === null ||
    (_hasPublishAt === false && Date.now() - _probedAt > NEGATIVE_TTL_MS);
  if (stale) {
    try {
      const rows = await sql`
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'posts'
          AND column_name = 'publish_at'
        LIMIT 1`;
      _hasPublishAt = rows.length > 0;
    } catch {
      _hasPublishAt = false;
    }
    _probedAt = Date.now();
  }
  return _hasPublishAt ? VISIBLE_SCHEDULED : VISIBLE_LEGACY;
}

/** Test seam: forget the probe result. Not used in production code paths. */
export function _resetSchemaProbe() {
  _hasPublishAt = null;
  _probedAt = 0;
}

/** True only once the probe has confirmed the column. Used by the write path. */
export async function schedulingSupported(sql) {
  await visibleWhere(sql);
  return _hasPublishAt === true;
}
