// Authors CRUD for the CMS. Auth required.
//   GET    /api/admin/authors          list
//   POST   /api/admin/authors          create
//   PUT    /api/admin/authors?id=...   update
//   DELETE /api/admin/authors?id=...   delete
import { db } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import { slugify } from '../_lib/blog.js';
import { invalidateAuthors, initialsFor } from '../_lib/authors.js';
import { sendJson, sendError, httpError, readBody } from '../_lib/http.js';

const MIGRATION_NEEDED =
  'The authors table does not exist yet. Run `node scripts/migrate-blog.mjs` ' +
  'against the production database to create it.';

/** Postgres "relation does not exist". */
const UNDEFINED_TABLE = '42P01';

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

function normalize(body) {
  const name = String(body.name || '').trim();
  if (!name) throw httpError(400, 'Name is required.');
  const slug = slugify(body.slug || name);
  if (!slug) throw httpError(400, 'That name produces an empty slug — set one by hand.');
  const bio = String(body.bio || '').trim();
  if (bio.length > 600) {
    throw httpError(400, 'Bio is over 600 characters — the card is a short introduction, not a profile page.');
  }
  return {
    slug,
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

export default async function handler(req, res) {
  try {
    await requireAdmin(req);
    const sql = db();
    const id = parseInt(new URL(req.url, 'http://x').searchParams.get('id') || '0', 10);

    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM authors ORDER BY sort_order ASC, name ASC`;
      return sendJson(res, 200, { authors: rows });
    }

    if (req.method === 'POST') {
      const a = normalize(readBody(req));
      const [clash] = await sql`SELECT 1 FROM authors WHERE slug = ${a.slug}`;
      if (clash) throw httpError(409, `The slug "${a.slug}" is already taken.`);
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
      // The slug derives the Person @id, which ties this human to every post
      // they have written. Renaming it would mint a second entity for the same
      // person and orphan the first, so it is fixed once created.
      if (a.slug !== current.slug) {
        throw httpError(
          409,
          `The URL slug cannot be changed once an author exists: it is part of their identity in the structured data. Delete and recreate if you really need "${a.slug}".`
        );
      }
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
