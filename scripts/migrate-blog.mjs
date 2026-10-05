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
     publish_at    TIMESTAMPTZ,
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
  // Scheduled publishing: the UTC instant a `scheduled` post becomes public.
  // NULL for drafts and published posts. Existing rows need no backfill — they
  // are all 'draft' or 'published', which the read-time condition treats
  // exactly as it did before this column existed.
  `ALTER TABLE posts ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ`,
  // Authors live in the database so a byline's role, bio and profile links can
  // be edited in the CMS rather than in a deploy. The single author in
  // src/seo/author.js stays the fallback for when this table is empty or
  // unreachable, so the blog never loses its bylines.
  //
  // There is deliberately no `has_page` or `url` column: authors have no pages
  // and no URLs of their own. The card at the foot of a post is the whole
  // surface, and the only links on it are the off-site profile icons.
  `CREATE TABLE IF NOT EXISTS authors (
     id          BIGSERIAL PRIMARY KEY,
     slug        TEXT UNIQUE NOT NULL,
     name        TEXT NOT NULL,
     job_title   TEXT NOT NULL DEFAULT '',
     initials    TEXT NOT NULL DEFAULT '',
     avatar_url  TEXT NOT NULL DEFAULT '',
     bio         TEXT NOT NULL DEFAULT '',
     linkedin    TEXT NOT NULL DEFAULT '',
     instagram   TEXT NOT NULL DEFAULT '',
     x_url       TEXT NOT NULL DEFAULT '',
     website     TEXT NOT NULL DEFAULT '',
     sort_order  INT NOT NULL DEFAULT 100,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  // Guarded for a database that already has the table from an earlier run.
  `ALTER TABLE authors ADD COLUMN IF NOT EXISTS avatar_url TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE authors ADD COLUMN IF NOT EXISTS instagram TEXT NOT NULL DEFAULT ''`,
  `CREATE INDEX IF NOT EXISTS idx_authors_name ON authors (lower(name))`,
  `CREATE INDEX IF NOT EXISTS idx_posts_status_pub
     ON posts (status, published_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_publish_at
     ON posts (publish_at) WHERE publish_at IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags)`,
];

for (const stmt of STATEMENTS) {
  await sql.query(stmt);
  console.log('✓', stmt.split('\n')[0].trim());
}

// Seed the authors table from the code-defined author, the first time only. An
// existing row is never overwritten: once an author is editable in the CMS,
// re-running the migration must not quietly undo someone's edits.
const { AUTHOR } = await import('../src/seo/author.js');
const [seeded] = await sql`SELECT 1 FROM authors WHERE slug = ${AUTHOR.slug}`;
if (seeded) {
  console.log('• author', AUTHOR.slug, 'already present — left untouched');
} else {
  await sql`
    INSERT INTO authors (slug, name, job_title, initials, linkedin, sort_order)
    VALUES (${AUTHOR.slug}, ${AUTHOR.name}, ${AUTHOR.jobTitle},
            ${AUTHOR.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()},
            ${AUTHOR.linkedin}, 0)`;
  console.log('✓ seeded author', AUTHOR.slug);
}

const [{ count }] = await sql`SELECT count(*)::int AS count FROM posts`;
const [{ acount }] = await sql`SELECT count(*)::int AS acount FROM authors`;
console.log(`\n✓ Schema ready. ${count} post(s), ${acount} author(s) in the database.`);
process.exit(0);
