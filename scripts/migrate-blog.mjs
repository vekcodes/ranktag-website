// Creates / updates the blog schema. Run: node scripts/migrate-blog.mjs
// Reads DATABASE_URL from the environment or .env.local.
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

// ── Lightweight .env.local loader (Node 18 has no --env-file) ──
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
} catch {
  /* no .env.local — rely on real env */
}

const CONN =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!CONN) {
  console.error(
    '✗ No DATABASE_URL found. Create the Neon database in Vercel, then run `vercel env pull .env.local`.'
  );
  process.exit(1);
}

const sql = neon(CONN);

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS posts (
     id            BIGSERIAL PRIMARY KEY,
     slug          TEXT UNIQUE NOT NULL,
     title         TEXT NOT NULL,
     excerpt       TEXT DEFAULT '',
     content_html  TEXT NOT NULL DEFAULT '',
     content_md    TEXT DEFAULT '',
     source_format TEXT DEFAULT 'html',
     cover_image_url TEXT DEFAULT '',
     cover_image_alt TEXT DEFAULT '',
     meta_title    TEXT DEFAULT '',
     meta_description TEXT DEFAULT '',
     og_image_url  TEXT DEFAULT '',
     canonical_url TEXT DEFAULT '',
     custom_jsonld TEXT DEFAULT '',
     faqs          JSONB NOT NULL DEFAULT '[]'::jsonb,
     tags          TEXT[] NOT NULL DEFAULT '{}',
     author        TEXT DEFAULT 'RankedTag',
     status        TEXT NOT NULL DEFAULT 'draft',
     reading_minutes INT DEFAULT 1,
     published_at  TIMESTAMPTZ,
     created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  // Author-supplied JSON-LD (one object or an array), merged into the
  // auto-generated BlogPosting + BreadcrumbList on render. Added after the
  // initial schema, so guard with IF NOT EXISTS for existing databases.
  `ALTER TABLE posts ADD COLUMN IF NOT EXISTS custom_jsonld TEXT DEFAULT ''`,
  // Per-post FAQ entries: a JSON array of { q, a } objects, rendered as a
  // dropdown accordion at the bottom of the post and emitted as FAQPage
  // JSON-LD. Added later, so guard with IF NOT EXISTS for existing databases.
  `ALTER TABLE posts ADD COLUMN IF NOT EXISTS faqs JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `CREATE INDEX IF NOT EXISTS idx_posts_status_pub
     ON posts (status, published_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags)`,
];

for (const stmt of STATEMENTS) {
  await sql.query(stmt);
  console.log('✓', stmt.split('\n')[0].trim());
}

const [{ count }] = await sql`SELECT count(*)::int AS count FROM posts`;
console.log(`\n✓ Schema ready. ${count} post(s) in the database.`);
process.exit(0);
