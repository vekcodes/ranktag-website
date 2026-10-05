// Authors, read from the database so a byline's role, bio and profile links
// can be changed in the CMS instead of in a deploy.
//
// The single author in src/seo/author.js stays as the fallback. If the table
// is missing (code deployed ahead of the migration) or empty, bylines and the
// author card keep working exactly as they did before authors became
// editable. A blog that loses every byline because one table is not there yet
// is not an acceptable failure mode.
//
// Authors deliberately have NO pages and NO URLs of their own. The card at the
// foot of a post is the whole surface: a name, a role, and off-site profile
// icons. Nothing here mints a route, a sitemap entry or an internal link.
import { AUTHOR, AUTHOR_ID } from '../../src/seo/author.js';
import { SITE_URL } from './site.js';

/** "Bhushan Raj Shakya" -> "BR". Used when an author has no avatar image. */
export function initialsFor(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase() || '?';
}

/**
 * The Person `@id` for an author.
 *
 * The site's own founder keeps the @id the sitewide org graph already uses —
 * minting a second one would split one human into two entities that Google has
 * to guess are the same person. Everyone else gets an id derived from their
 * slug, never stored, because an editable identity is not an identity.
 */
export function personId(a) {
  return a && a.name === AUTHOR.name ? AUTHOR_ID : `${SITE_URL}/#person-${a.slug}`;
}

/** Row -> the shape the renderer and the schema expect. */
export function fromRow(r) {
  const social = [
    { key: 'linkedin', label: 'LinkedIn', url: r.linkedin || '' },
    { key: 'instagram', label: 'Instagram', url: r.instagram || '' },
    { key: 'x', label: 'X', url: r.x_url || '' },
    { key: 'website', label: 'Website', url: r.website || '' },
  ].filter((s) => s.url);
  return {
    slug: r.slug,
    name: r.name,
    id: personId(r),
    // No author has a page on this site, so no Person carries a `url`. An @id
    // identifies the entity without claiming a page exists for it.
    jobTitle: r.job_title || '',
    initials: r.initials || initialsFor(r.name),
    avatarUrl: r.avatar_url || '',
    bio: r.bio || '',
    social,
    sameAs: social.map((s) => s.url),
  };
}

/**
 * The fallback registry: the one author the site had before this table
 * existed. Shaped exactly like a database row so every caller is identical.
 */
export function codeAuthors() {
  return [
    fromRow({
      slug: AUTHOR.slug,
      name: AUTHOR.name,
      job_title: AUTHOR.jobTitle,
      linkedin: AUTHOR.linkedin,
    }),
  ];
}

// Cached per warm instance. Short, because an author edit should show up on
// the next page view rather than whenever the instance happens to recycle.
let _cache = null;
let _at = 0;
const TTL_MS = 30_000;

export async function loadAuthors(sql) {
  if (_cache && Date.now() - _at < TTL_MS) return _cache;
  let list;
  try {
    const rows = await sql`
      SELECT slug, name, job_title, initials, avatar_url, bio,
             linkedin, instagram, x_url, website
      FROM authors ORDER BY sort_order ASC, name ASC`;
    list = rows.length ? rows.map(fromRow) : codeAuthors();
  } catch {
    // Table absent or unreachable — degrade to the code registry rather than
    // letting one missing table take the whole blog down.
    list = codeAuthors();
  }
  _cache = list;
  _at = Date.now();
  return _cache;
}

/** Publishes an admin edit immediately instead of waiting out the TTL. */
export function invalidateAuthors() {
  _cache = null;
  _at = 0;
}

/** Case-insensitive, matching on either the display name or the slug. */
export function pickAuthor(authors, nameOrSlug) {
  const key = String(nameOrSlug || '').trim().toLowerCase();
  if (!key) return null;
  return (
    (authors || []).find((a) => a.name.toLowerCase() === key || a.slug === key) ||
    null
  );
}
