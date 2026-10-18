// Rewrites the in-body links inside published posts after the /services ->
// /what-we-do move, and removes rel="nofollow" from links that point at our
// own domain.
//
// Two separate bugs, one pass:
//   1. 33 posts link to /services/* URLs that now 301. A link to a redirect
//      still works for a reader, but it wastes a hop and it is the exact thing
//      the migration protocol forbids leaving behind.
//   2. Those same links carry rel="noopener noreferrer nofollow" and
//      target="_blank" — i.e. the blog nofollows our own money pages. That
//      predates the migration and is worth more than the redirect fix.
//
// ORDER OF OPERATIONS — READ THIS FIRST
//   The blog is server-rendered from this database on every request, so the
//   moment these bodies change, the LIVE site links to the new URLs. If the
//   branch that creates /what-we-do/* has not been deployed yet, every one of
//   those links is a live 404. Deploy first, confirm /what-we-do responds 200
//   in production, and only then run this with --apply.
//   The script enforces this below: it probes production and refuses to write
//   until the destination URLs actually exist.
//
// SAFETY
//   - Dry run by default. Nothing is written without --apply.
//   - Prints a per-post diff summary before it touches anything.
//   - Writes a JSON backup of every row it will modify, before modifying it.
//   - Refuses to run against a database that does not look like production
//     (fewer than MIN_POSTS published rows), because the credentials supplied
//     so far have pointed at a dev branch holding a single `test` row.
//
// USAGE
//   node scripts/fix-blog-service-links.mjs              # dry run
//   node scripts/fix-blog-service-links.mjs --apply      # write
//
// Reads DATABASE_URL from .env.local or the environment.
import { readFileSync, writeFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const APPLY = process.argv.includes('--apply');
const MIN_POSTS = 20;

function connectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    const m = env.match(/^DATABASE_URL=(.+)$/m);
    if (m) return m[1].trim();
  } catch {}
  throw new Error('No DATABASE_URL. Set it in the environment or in .env.local.');
}

// Old path -> new path. Slug-for-slug except the two that were renamed.
const MOVES = {
  '/services/b2b-saas-seo': '/what-we-do/seo',
  '/services/saas-content-marketing': '/what-we-do/content-marketing',
  '/services/ai-seo': '/what-we-do/ai-seo',
  '/services/generative-engine-optimization': '/what-we-do/generative-engine-optimization',
  '/services/answer-engine-optimization': '/what-we-do/answer-engine-optimization',
  '/services/technical-seo': '/what-we-do/technical-seo',
  '/services': '/what-we-do',
};

const SITE = 'https://rankedtag.com';
const SITE_HTTP = 'http://rankedtag.com';

// Longest first, so /services/ai-seo is matched before bare /services.
const ORDERED = Object.entries(MOVES).sort((a, b) => b[0].length - a[0].length);

function rewritePaths(html) {
  // Upgrade our own http:// links first. They 301 to https, so an internal
  // link written that way is a wasted hop for every crawler that follows it.
  let out = html.split(`href="${SITE_HTTP}`).join(`href="${SITE}`);
  let n = (html.match(/href="http:\/\/rankedtag\.com/g) || []).length;
  for (const [from, to] of ORDERED) {
    for (const variant of [`${SITE}${from}`, from]) {
      // Only inside href="..." — never touch prose that happens to say /services.
      const re = new RegExp(`(href=")${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=["/?#])`, 'g');
      out = out.replace(re, (_, p1) => {
        n += 1;
        return `${p1}${variant.startsWith('http') ? SITE + to : to}`;
      });
    }
  }
  return { html: out, count: n };
}

// Two posts render the URL as the link text. The href moved; the text has to
// move with it, or the page shows a URL that no longer exists.
function fixVisibleUrlText(html) {
  let n = 0;
  const out = html.replace(/rankedtag\.com\/services(\/[a-z-]+)?/g, (m, slug) => {
    n += 1;
    const path = slug ? (MOVES[`/services${slug}`] || `/what-we-do${slug}`) : '/what-we-do';
    return `rankedtag.com${path}`;
  });
  return { html: out, count: n };
}

// Strip nofollow (and the pointless noreferrer/_blank) from internal links only.
function unNofollowInternal(html) {
  let n = 0;
  const out = html.replace(/<a\s+([^>]*?)>/g, (tag, attrs) => {
    const href = attrs.match(/href="([^"]*)"/)?.[1] ?? '';
    const internal = href.startsWith('/') || href.startsWith(SITE) || href.startsWith(SITE_HTTP);
    // Query-string URLs (the blog's noindex ?tag= views) keep their nofollow.
    const filtered = href.includes('?');
    if (!internal || filtered || !/nofollow/.test(attrs)) return tag;
    n += 1;
    let a = attrs
      .replace(/\s*rel="[^"]*"/, '')
      .replace(/\s*target="_blank"/, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return `<a ${a}>`;
  });
  return { html: out, count: n };
}

const sql = neon(connectionString());

const rows = await sql`SELECT id, slug, content_html FROM posts WHERE content_html IS NOT NULL`;
const published = await sql`SELECT count(*)::int AS n FROM posts WHERE status = 'published'`;

console.log(`Connected. ${rows.length} posts with bodies, ${published[0].n} published.`);

if (published[0].n < MIN_POSTS) {
  console.error(
    `\nREFUSING TO RUN. Only ${published[0].n} published posts found; production has 33.\n` +
      `This connection string points at a dev branch, not production. Nothing was changed.`
  );
  process.exit(1);
}

// Deploy gate. The destination URLs must already be live, because the blog is
// rendered from this table on every request and a write here is instantly
// visible. Learned the hard way: running this before the deploy put 94 live
// 404s into 33 published posts.
async function destinationsAreLive() {
  const probes = [...new Set(Object.values(MOVES))];
  const results = await Promise.all(
    probes.map(async (path) => {
      try {
        const res = await fetch(`${SITE}${path}`, { redirect: 'follow' });
        return { path, status: res.status };
      } catch (e) {
        return { path, status: 0, error: String(e) };
      }
    })
  );
  const dead = results.filter((r) => r.status !== 200);
  return { dead, results };
}

if (APPLY) {
  const { dead } = await destinationsAreLive();
  if (dead.length) {
    console.error('\nREFUSING TO WRITE. These destination URLs are not live yet:');
    for (const d of dead) console.error(`  ${String(d.status).padStart(3)}  ${SITE}${d.path}`);
    console.error(
      '\nThe blog renders from this database on every request, so writing now would put\n' +
        'live 404s into published posts. Deploy the branch first, then re-run.'
    );
    process.exit(1);
  }
  console.log('Deploy gate passed: every destination URL returns 200 in production.');
}

const changes = [];
for (const r of rows) {
  const a = rewritePaths(r.content_html);
  const t = fixVisibleUrlText(a.html);
  const b = unNofollowInternal(t.html);
  if (b.html !== r.content_html) {
    changes.push({ id: r.id, slug: r.slug, before: r.content_html, after: b.html, links: a.count + t.count, nofollow: b.count });
  }
}

console.log(`\n${changes.length} posts need changes:\n`);
let totalLinks = 0;
let totalNofollow = 0;
for (const c of changes) {
  totalLinks += c.links;
  totalNofollow += c.nofollow;
  console.log(`  ${c.slug.padEnd(60)} ${String(c.links).padStart(3)} links, ${String(c.nofollow).padStart(3)} nofollow removed`);
}
console.log(`\nTotal: ${totalLinks} links repointed, ${totalNofollow} internal nofollow removed.`);

if (!APPLY) {
  console.log('\nDry run. Re-run with --apply to write.');
  process.exit(0);
}

const backup = `blog-bodies-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(backup, JSON.stringify(changes.map(({ id, slug, before }) => ({ id, slug, before })), null, 2));
console.log(`\nBackup written to ${backup}`);

for (const c of changes) {
  await sql`UPDATE posts SET content_html = ${c.after} WHERE id = ${c.id}`;
  console.log(`  updated ${c.slug}`);
}
console.log(`\nDone. ${changes.length} posts updated. updated_at was left untouched so sitemap lastmod stays truthful.`);
