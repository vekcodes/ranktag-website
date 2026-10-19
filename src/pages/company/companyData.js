// Head meta for the four company pages: contact, privacy, terms and the
// case-study index.
//
// Pure data only — imported by the Vite config at build time via routeMeta.js,
// so no React, no CSS, no browser globals.
import { SITE } from '../whatWeDo/capabilitiesData.js';

export { SITE };

// The date the legal pages were last substantively changed. Rendered on the
// page AND used in the schema, so the two can never disagree. Bump it only
// when the terms actually change, never on a deploy.
export const LEGAL_UPDATED = '2026-10-19';
export const LEGAL_UPDATED_HUMAN = '19 October 2026';

export const CONTACT_META = {
  title: 'Contact RankedTag: Two Addresses and Who Reads Them',
  description:
    'How to reach RankedTag, what to send, and what happens after you do. Two email addresses, a 48-hour reply, and the four founder reviews taken each month.',
  canonical: `${SITE}/contact`,
};

export const PRIVACY_META = {
  title: 'Privacy Policy: What RankedTag Collects and Why',
  description:
    'Exactly what this site collects: application form fields, Google Analytics, RB2B visitor identification, and what the free tools do with a URL. Plainly stated.',
  canonical: `${SITE}/privacy`,
};

export const TERMS_META = {
  title: 'Terms of Use: The Site, the Free Tools and the Shortlists',
  description:
    'The terms covering this website, the free SEO tools and the published agency shortlists: what is warranted, what is not, and what governs client work instead.',
  canonical: `${SITE}/terms`,
};

export const CASE_STUDIES_META = {
  title: 'Case Studies: One, and What It Took to Publish It',
  description:
    'RankedTag has one measured client result, Sendr.ai in B2B SaaS. This page is the index, the standard of proof behind it, and what is deliberately not here.',
  canonical: `${SITE}/case-studies`,
};
