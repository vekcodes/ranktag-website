// The site's author entity. One source of truth, imported by the blog SSR
// schema and the author registry fallback.
//
// There is no author page and no author URL anywhere on this site. The author
// card at the foot of a post is the whole surface.
//
// Pure data only — pulled in by the Vite config at build time, so no React,
// no CSS, no browser globals.
export const AUTHOR = {
  name: 'Bhushan Raj Shakya',
  slug: 'bhushan-raj-shakya',
  jobTitle: 'Founder',
  linkedin: 'https://www.linkedin.com/in/bhushan-raj-shakya-9835a025b/',
};

/**
 * Person node for BlogPosting.author.
 *
 * Deliberately carries NO `url`: authors have no pages anywhere on this site,
 * and a `url` pointing at a page that does not exist is worse than no `url` at
 * all. `sameAs` carries only profiles confirmed to exist, for the same reason
 * — an invented profile URL is a verifiable falsehood in structured data.
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
  worksFor: { '@id': 'https://rankedtag.com/#org' },
  sameAs: [AUTHOR.linkedin],
};
