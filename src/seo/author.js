// The site's author entity. One source of truth, imported by the blog SSR
// schema and the author registry fallback.
//
// The founder now has a page at /about, so this entity carries a `url` and a
// portrait. Other authors still have none: a `url` pointing at a page that
// does not exist is worse than no `url` at all, so only authors with a real
// page ever get one.
//
// Pure data only — pulled in by the Vite config at build time, so no React,
// no CSS, no browser globals.
export const AUTHOR = {
  name: 'Bhushan Raj Shakya',
  slug: 'bhushan-raj-shakya',
  jobTitle: 'Founder',
  url: 'https://rankedtag.com/about',
  image: 'https://rankedtag.com/founder-bhushan-raj-shakya.jpg',
  // 160px square crop of the same photo, for the 52px blog author card. The
  // full portrait is 140KB and would be a waste at that size.
  avatar: 'https://rankedtag.com/founder-bhushan-raj-shakya-avatar.jpg',
  linkedin: 'https://www.linkedin.com/in/bhushan-raj-shakya-9835a025b/',
};

/**
 * Person node for BlogPosting.author.
 *
 * Carries the `url` of /about, which is this person's page and the canonical
 * description of them. `sameAs` carries only profiles confirmed to exist: an
 * invented profile URL is a verifiable falsehood in structured data.
 */
export const AUTHOR_ID = 'https://rankedtag.com/#founder';

export const AUTHOR_PERSON = {
  '@type': 'Person',
  // Deliberately the SAME @id the sitewide org graph already uses for the
  // founder. Minting a second id would split one human into two entities that
  // Google has to guess are the same person.
  '@id': AUTHOR_ID,
  name: AUTHOR.name,
  jobTitle: AUTHOR.jobTitle,
  url: AUTHOR.url,
  image: AUTHOR.image,
  worksFor: { '@id': 'https://rankedtag.com/#org' },
  sameAs: [AUTHOR.linkedin],
};
