// Authors CRUD for the CMS. Auth required.
//   GET    /api/admin/posts?resource=authors          list
//   POST   /api/admin/posts?resource=authors          create
//   PUT    /api/admin/posts?resource=authors&id=...   update
//   DELETE /api/admin/posts?resource=authors&id=...   delete
//
// This lives in _lib rather than as api/admin/authors.js, and is dispatched to
// by the posts function, because Vercel's Hobby plan caps a deployment at 12
// serverless functions and the project is already at exactly 12. Files under
// a _-prefixed directory are helpers, not functions, so routing authors
// through an existing endpoint keeps the count unchanged. If the project ever
// moves to a plan without that cap, this can go back to being its own route
// with no change beyond the file's location and the client's URL.
import { db } from './db.js';
import { requireAdmin } from './auth.js';
import { slugify } from './blog.js';
import { invalidateAuthors, initialsFor } from './authors.js';
import { AUTHOR } from '../../src/seo/author.js';
import { sendJson, sendError, httpError, readBody } from './http.js';

const MIGRATION_NEEDED =
  'The authors table does not exist and could not be created automatically. ' +
  'Run `node scripts/migrate-blog.mjs` against this database, or check that ' +
  'the database user is allowed to create tables.';

/** Postgres "relation does not exist". */
const UNDEFINED_TABLE = '42P01';

/**
 * The authors schema, created on demand.
 *
 * Normally a schema change is a deploy-time migration, not something a request
 * performs. This is the deliberate exception: the table is additive, nothing
 * else reads or writes it, and the alternative was an admin staring at "run
 * the migration" with no way to run it — the production connection string is
 * not something you have to hand while using the CMS. Every statement is
 * idempotent, so this is safe to attempt repeatedly and safe to race.
 *
 * Kept byte-for-byte in step with scripts/migrate-blog.mjs, which remains the
 * way to do it ahead of time.
 */
const SCHEMA = [
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
  // Guards for a table created by an earlier version of this schema.
  `ALTER TABLE authors ADD COLUMN IF NOT EXISTS avatar_url TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE authors ADD COLUMN IF NOT EXISTS instagram TEXT NOT NULL DEFAULT ''`,
  `CREATE INDEX IF NOT EXISTS idx_authors_name ON authors (lower(name))`,
];

// Postgres codes for "someone else just created this", which two admins
// loading the page at once can produce. Both mean success, not failure.
const ALREADY_EXISTS = new Set(['42P07', '42710']);

// Per warm instance: the work is idempotent, but there is no reason to repeat
// four round trips on every request.
let _schemaReady = false;

/**
 * Create the authors table if it is missing, and seed it with the site's
 * code-defined author so the CMS opens on a populated list rather than an
 * empty one that looks broken.
 */
async function ensureAuthorsTable(sql) {
  if (_schemaReady) return;
  for (const stmt of SCHEMA) {
    try {
      await sql.query(stmt);
    } catch (err) {
      if (!ALREADY_EXISTS.has(err?.code)) throw err;
    }
  }
  const [seeded] = await sql`SELECT 1 FROM authors LIMIT 1`;
  if (!seeded) {
    await sql`
      INSERT INTO authors (slug, name, job_title, initials, linkedin, sort_order)
      VALUES (${AUTHOR.slug}, ${AUTHOR.name}, ${AUTHOR.jobTitle},
              ${initialsFor(AUTHOR.name)}, ${AUTHOR.linkedin}, 0)
      ON CONFLICT (slug) DO NOTHING`;
  }
  _schemaReady = true;
  invalidateAuthors();
}

/**
 * A profile URL is stored only if it is a real absolute http(s) URL on the
 * expected host. These become the Person's `sameAs`, and a sameAs pointing
 * somewhere that does not resolve is a verifiable falsehood in structured
 * data — so a typo is rejected at the point of entry rather than published.
 */
function profileUrl(raw, label, hosts) {
  const v = String(raw || '').trim();
  if (!v) return '';
  let u;
  try {
    u = new URL(v);
  } catch {
    throw httpError(400, `${label} must be a full URL, starting with https://`);
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    throw httpError(400, `${label} must be an http or https URL.`);
  }
  const host = u.hostname.replace(/^www\./, '').toLowerCase();
  if (hosts && !hosts.some((h) => host === h || host.endsWith('.' + h))) {
    throw httpError(400, `${label} does not look like a ${hosts[0]} URL.`);
  }
  return u.toString();
}

/**
 * The internal key for an author, derived from their name and never entered by
 * hand. It is NOT a URL and never appears in one: authors have no pages. It
 * exists only to key the row and to derive a stable Person `@id` in the
 * structured data, so that editing a name later does not split one human into
 * two entities.
 *
 * Two people with the same name get `-2`, `-3` and so on, silently. Asking an
 * editor to resolve a key collision for a field they never see would be a
 * worse failure than a suffix nobody reads.
 */
async function uniqueSlug(sql, name) {
  const base = slugify(name) || 'author';
  const taken = await sql`
    SELECT slug FROM authors WHERE slug = ${base} OR slug LIKE ${base + '-%'}`;
  const used = new Set(taken.map((r) => r.slug));
  if (!used.has(base)) return base;
  for (let i = 2; ; i += 1) {
    if (!used.has(`${base}-${i}`)) return `${base}-${i}`;
  }
}

function normalize(body) {
  const name = String(body.name || '').trim();
  if (!name) throw httpError(400, 'Name is required.');
  const bio = String(body.bio || '').trim();
  if (bio.length > 600) {
    throw httpError(400, 'Bio is over 600 characters — the card is a short introduction, not a profile page.');
  }
  return {
    name,
    bio,
    initials: String(body.initials || '').trim().slice(0, 3) || initialsFor(name),
    job_title: String(body.job_title || '').trim(),
    avatar_url: String(body.avatar_url || '').trim(),
    linkedin: profileUrl(body.linkedin, 'LinkedIn URL', ['linkedin.com']),
    instagram: profileUrl(body.instagram, 'Instagram URL', ['instagram.com']),
    x_url: profileUrl(body.x_url, 'X URL', ['x.com', 'twitter.com']),
    // No host restriction: a personal site can be on any domain. Still has to
    // be a real absolute http(s) URL, because it becomes a sameAs.
    website: profileUrl(body.website, 'Website URL', null),
    sort_order: Number.isFinite(+body.sort_order) ? +body.sort_order : 100,
  };
}

export async function handleAuthors(req, res) {
  try {
    await requireAdmin(req);
    const sql = db();
    // Create the table on first use rather than making the admin go and find a
    // production connection string. Idempotent, so it costs nothing after the
    // first call on a warm instance.
    await ensureAuthorsTable(sql);
    const id = parseInt(new URL(req.url, 'http://x').searchParams.get('id') || '0', 10);

    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM authors ORDER BY sort_order ASC, name ASC`;
      return sendJson(res, 200, { authors: rows });
    }

    if (req.method === 'POST') {
      const a = normalize(readBody(req));
      a.slug = await uniqueSlug(sql, a.name);
      const [row] = await sql`
        INSERT INTO authors (slug,name,job_title,initials,avatar_url,bio,
                             linkedin,instagram,x_url,website,sort_order)
        VALUES (${a.slug},${a.name},${a.job_title},${a.initials},${a.avatar_url},${a.bio},
                ${a.linkedin},${a.instagram},${a.x_url},${a.website},${a.sort_order})
        RETURNING id, slug`;
      invalidateAuthors();
      return sendJson(res, 201, { author: row });
    }

    if (!id) throw httpError(405, 'Method not allowed');

    if (req.method === 'PUT') {
      const a = normalize(readBody(req));
      const [current] = await sql`SELECT slug FROM authors WHERE id = ${id}`;
      if (!current) throw httpError(404, 'Author not found');
      // The stored slug stays put even when the name is edited. It derives the
      // Person @id, which ties this human to every post they have written, so
      // recomputing it from a corrected spelling would mint a second entity
      // for the same person and orphan the first.
      await sql`
        UPDATE authors SET name=${a.name}, job_title=${a.job_title}, initials=${a.initials},
          avatar_url=${a.avatar_url}, bio=${a.bio}, linkedin=${a.linkedin},
          instagram=${a.instagram}, x_url=${a.x_url}, website=${a.website},
          sort_order=${a.sort_order}, updated_at=now()
        WHERE id = ${id}`;
      invalidateAuthors();
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'DELETE') {
      const [a] = await sql`SELECT name FROM authors WHERE id = ${id}`;
      if (!a) throw httpError(404, 'Author not found');
      // Posts store the byline as text, so deleting an author orphans nothing
      // — but it does silently strip the card and the profile links from
      // everything they wrote, which is worth saying out loud.
      const [{ n }] = await sql`
        SELECT count(*)::int AS n FROM posts WHERE lower(author) = lower(${a.name})`;
      if (n > 0 && !readBody(req).force) {
        throw httpError(
          409,
          `${a.name} is the byline on ${n} post(s). Deleting removes the author card and profile links from all of them; the byline itself stays. Confirm to proceed.`
        );
      }
      await sql`DELETE FROM authors WHERE id = ${id}`;
      invalidateAuthors();
      return sendJson(res, 200, { ok: true });
    }

    throw httpError(405, 'Method not allowed');
  } catch (err) {
    // The CMS is the one place that should say plainly that the migration has
    // not been run — everywhere else quietly falls back to the code author.
    if (err && err.code === UNDEFINED_TABLE) return sendError(res, httpError(503, MIGRATION_NEEDED));
    sendError(res, err);
  }
}
