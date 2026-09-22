// The site's author entity. One source of truth, imported by the author page,
// the blog SSR schema, and the sitemap.
//
// Pure data only — pulled in by the Vite config at build time, so no React,
// no CSS, no browser globals.
export const AUTHOR = {
  name: 'Bhushan Raj Shakya',
  slug: 'bhushan-raj-shakya',
  url: 'https://rankedtag.com/about/bhushan-raj-shakya',
  jobTitle: 'Founder',
  linkedin: 'https://www.linkedin.com/in/bhushan-raj-shakya-9835a025b/',
};

export const AUTHOR_PATH = `/about/${AUTHOR.slug}`;

/**
 * Person node for BlogPosting.author and the author page itself.
 * `sameAs` carries only profiles confirmed to exist — an invented profile URL
 * is worse than none, because it is a verifiable falsehood in structured data.
 */
export const AUTHOR_PERSON = {
  '@type': 'Person',
  '@id': `${AUTHOR.url}#person`,
  name: AUTHOR.name,
  url: AUTHOR.url,
  jobTitle: AUTHOR.jobTitle,
  worksFor: { '@id': 'https://rankedtag.com/#org' },
  sameAs: [AUTHOR.linkedin],
};
