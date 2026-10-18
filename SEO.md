# SEO

**10 September 2026:** the current step-by-step plan, page buckets, keyword tiers and content briefs live in [docs/SEO-GEO-ROADMAP.md](docs/SEO-GEO-ROADMAP.md). It was produced by running `seo-geo-audit-playbook.md` against this site and supersedes the Week 1 and Week 2 sections below where they differ. The service pages and `/work` are real indexable pages again, so the single-page tradeoff described under Crawling & indexing no longer applies.

Two halves. The first is done and lives in code. The second is yours, and it
is the half that actually decides whether you rank — technical SEO gets you
eligible to compete, it does not win anything on its own.

---

## Part 1 — What is already handled

You do not need to install a plugin, buy Yoast, or think about any of this
again.

**Crawling & indexing**
- `sitemap.xml` generated from real routes, including every published post,
  with accurate `lastModified` dates. Regenerates hourly and immediately on
  publish.
- `robots.txt` allowing everything except `/admin` and `/api`.
- `rss.xml` feed.
- Self-referencing `<link rel="canonical">` on every single page — the most
  common technical miss on agency sites, and free to get right.
- `www → apex` 301 redirect, plus redirects from the old WordPress URL shapes
  (`/infernomedia/*`, `/our-work`, `/contact-us`, `/audit`) so no old link
  lands on a 404.
- The marketing site collapsed from six pages to one anchored page. The old
  routes (`/services`, `/services/*`, `/work`, `/about`, `/contact`,
  `/free-email-audit`) all 308 to their section on `/`, so existing backlinks
  and ad destinations still land somewhere real. The tradeoff is deliberate
  and worth knowing: those four service URLs each targeted a distinct
  high-intent keyword and can no longer rank independently. Their copy now
  lives in the `#services` section of the home page, which means the home
  page has to carry all four keywords at once. If keyword-level ranking
  matters more than the single-page flow, the service pages are the first
  thing to bring back.

**On-page**
- Exactly one `<h1>` per page. Body H1s pasted into the CMS are demoted to H2
  automatically.
- Unique title and meta description on every route, all 24–60 characters after
  the brand suffix is appended, so none get truncated in results.
- Heading anchors and an auto table of contents on long posts — this is what
  produces jump-to-section links under a result.
- Descriptive alt text on every image; the CMS refuses to insert one without.
- Semantic HTML: `article`, `figure`/`figcaption`, `nav` with `aria-label`,
  breadcrumb `ol`, real `<button>`s, skip link, visible focus rings.

**Structured data** (all validated shapes)
- `Organization` + `ProfessionalService` + `WebSite` in the root layout, with
  stable `@id`s so every other node references them instead of duplicating.
- `BreadcrumbList` on every sub-page.
- `Service` on each service page.
- `FAQPage` on the home page, each service page, the audit page, and any post
  with FAQs — this is the one that wins expandable answers in the SERP.
- `BlogPosting` with `wordCount`, `datePublished`, `dateModified` and a proper
  author node on every post.
- `Offer` on the free audit page.

**Performance** (Core Web Vitals are a ranking factor)
- Static generation for every marketing page; ISR for the blog.
- Fonts self-hosted at build time via `next/font` — no render-blocking
  request to Google, no layout shift.
- AVIF/WebP conversion, responsive `sizes`, `priority` on the LCP image only.
- Immutable cache headers on images and fonts.
- Almost no client JavaScript: the scroll reveals are one shared
  `IntersectionObserver`, the marquee is pure CSS.

**Security headers** — HSTS, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`. Minor signals, but they cost nothing.

---

## Part 2 — Your side

### Week 1 — launch plumbing

Do these in order. Nothing below matters until they are done.

1. **Point the domain.** Vercel → Settings → Domains → add
   `infernoemails.com` and `www.infernoemails.com`. Set the apex as primary.

2. **Google Search Console.** Add the property as a *Domain* property (not
   URL-prefix — domain covers every subdomain and protocol). Verify by DNS TXT
   record. Then submit `https://infernoemails.com/sitemap.xml`.
   This is non-negotiable — it is how you find out what you rank for.

3. **Bing Webmaster Tools.** Takes two minutes and imports directly from
   Search Console. Bing feeds ChatGPT search results, which is a real and
   growing referral source.

4. **Analytics.** Vercel Analytics (one toggle in the dashboard, privacy-safe,
   no cookie banner needed) or GA4 if you want funnel reporting. Do not run
   both — you will just slow the site down.

5. **Google Business Profile.** If you have any physical address or serve a
   named city, claim it. Agency searches carry heavy local intent and this is
   the single highest-return hour of SEO work available to a small agency.

6. **Fix `NEXT_PUBLIC_SITE_URL`** if the domain is not `infernoemails.com`.
   One env var; it feeds every canonical, sitemap entry and JSON-LD `@id`.

7. **If the old WordPress site was ever live on a domain with rankings**, tell
   me — old URLs need 301s to the new equivalents or you throw away every
   backlink you ever earned. The redirect block is in `next.config.ts`.

### Week 2 onward — the part that actually ranks

**Publish, consistently.** Two posts a month, forever, beats twelve posts in
one month and then silence. Google rewards freshness and consistency; a blog
that stopped in March signals an agency that might not exist in June.

**Write for the search someone actually types.** Your buyer does not search
"email marketing agency" first — they search the problem. Ranking for the
problem is how you reach them before your competitors do.

Start with these. The blog is now the only place the site can rank on
long-tail terms page by page, so it carries more weight than it used to.
Each post links back to the relevant section of the home page:

| Post | Links to |
|---|---|
| Why your Shopify emails are going to spam (and how to fix it) | `/#services` |
| Klaviyo welcome flow: what to send, in what order | `/#services` |
| Abandoned cart emails: 8 examples worth stealing from | `/#work` |
| How many emails should an ecommerce brand send per week? | `/#services` |
| SPF, DKIM and DMARC explained for people who sell things | `/#services` |
| Email design for dark mode: what breaks and what to do | `/#work` |
| Klaviyo flows vs campaigns: where the revenue really comes from | `/#services` |
| What a good email marketing benchmark actually looks like | `/#contact` |

Rules for each one:
- **One post, one primary keyword.** Two posts targeting the same phrase
  compete with each other; Google picks one and buries the other.
- **Put the keyword in the title, the H1, the first 100 words, and one H2.**
  Then stop. Repeating it thirty times has not worked since 2011.
- **1,200–2,000 words** for a how-to. Long enough to actually answer the
  question, short enough that you finish writing it.
- **Add 2–3 FAQs to every post.** The CMS turns them into `FAQPage` schema.
  This is the cheapest rich-result win available.
- **Link out to two authoritative sources** (Klaviyo docs, Google Postmaster,
  Litmus). Outbound links to good sources are a positive quality signal.
- **Link internally to a service page and to one other post.** Internal links
  are the most under-used ranking lever you control completely.
- **Use a real person as the author**, not "Inferno Emails". Google's E-E-A-T
  guidance rewards identifiable expertise. Add a name in the CMS author field.

**Get links. This is the whole game above a certain point.** Everything above
is table stakes; links are the differentiator. For an agency, the realistic
ones are:

- **Klaviyo's partner directory.** If you are not a listed Klaviyo partner,
  apply. It is a strong, relevant, high-authority link *and* a lead source.
- **Client sites.** Ask every happy client for a footer credit or a "who we
  work with" mention. Three of your clients would probably say yes today.
- **Agency directories** — Clutch, DesignRush, Shopify's partner directory,
  Sortlist. Free listings, real referral traffic.
- **Podcast guest spots** on ecommerce shows. Every episode gives a show-notes
  link and takes an hour.
- **Publish original data.** You have Klaviyo access across multiple accounts.
  An annual "ecommerce email benchmarks" post with real aggregated numbers
  (anonymised, with client permission) is the single most linkable thing you
  could make. Nobody links to another "10 tips" article; everybody links to
  data.
- **Answer questions publicly** — r/shopify, r/emailmarketing, Klaviyo's
  community forum, LinkedIn. Not link-dropping; genuinely useful answers with
  your name attached.

**Do not buy links.** Cheap link packages are the fastest way to a manual
penalty, and recovering from one takes longer than starting over.

### Ongoing — monthly, 30 minutes

- Search Console → **Performance**. Sort by impressions with low CTR: those
  are pages ranking but not being clicked. Rewrite the title and meta
  description. Fastest win in SEO.
- Search Console → **Pages**. Anything excluded or erroring gets fixed.
- Find queries you rank 8–20 for. Improving an existing page from position 12
  to 5 is far easier than a new page reaching page one.
- Re-run `npm run seo:check` after any structural change.
- Update your best-performing post once a year and change the date. Freshness
  is a real signal for "best/how-to" queries.

---

## What not to bother with

- **Keyword density.** Not a thing. Write for a person.
- **Meta keywords tag.** Ignored since 2009.
- **Submitting to 500 directories.** Spam.
- **AI-generated bulk posts.** Google's helpful-content systems specifically
  target this, and it is exactly the "another AI website" problem you asked
  to avoid. Two posts you actually wrote beat fifty you generated.
- **Chasing "email marketing agency"** as your first target. It is dominated
  by agencies with ten-year-old domains and six-figure link budgets. Win the
  problem-shaped long tail first; the head term follows domain authority, not
  the other way round.

---

## Verifying

```bash
npm run seo:check                  # local, against a running server
npm run seo:check https://infernoemails.com
```

Also worth running once after launch:
- [Rich Results Test](https://search.google.com/test/rich-results) — paste a
  post URL, confirm `BlogPosting` and `FAQPage` are detected.
- [PageSpeed Insights](https://pagespeed.web.dev/) — check the mobile score.
- [Schema validator](https://validator.schema.org/) — for the home page graph.
