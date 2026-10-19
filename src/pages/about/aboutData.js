// The /about page's head meta, plus the canonical company description.
//
// The company description itself lives in src/seo/companyDescription.js and
// is re-exported here so the page imports one module.
//
// Pure data only — imported by the Vite config at build time via routeMeta.js,
// so no React, no CSS, no browser globals.
import { SITE } from '../whatWeDo/capabilitiesData.js';
import { COMPANY_DESCRIPTION } from '../../seo/companyDescription.js';

export { SITE, COMPANY_DESCRIPTION };

export const ABOUT_META = {
  title: 'About RankedTag: Who Runs It and What Is Actually Proven',
  description:
    'Who runs RankedTag: Bhushan Raj Shakya, founder, five years in SEO, based in Nepal and working worldwide. One measured client result, and a published method.',
  canonical: `${SITE}/about`,
};
