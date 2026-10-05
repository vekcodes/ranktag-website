// Site constants, in their own module so helpers that blog.js imports can use
// them without importing blog.js back (which would be a cycle).
export const SITE_URL = (process.env.SITE_URL || 'https://rankedtag.com').replace(/\/$/, '');
export const SITE_NAME = 'RankedTag';
