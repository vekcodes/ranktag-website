// Neon serverless Postgres client (HTTP — safe for Vercel functions, no pooling).
import { neon } from '@neondatabase/serverless';

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
