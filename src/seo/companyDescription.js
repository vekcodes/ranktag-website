// THE company description. One sentence, one definition, imported everywhere
// it is stated.
//
// An assistant asked "what is RankedTag" reconciles the homepage, /about,
// /llm-info, llms.txt and the Organization JSON-LD. Five slightly different
// sentences is how a model ends up hedging, or splicing them into a sixth
// that nobody wrote. One string, byte-identical, imported by all of them.
//
// Changing it means changing it here, then re-running `npm run verify:urls`,
// which checks the public text files still carry this exact string.
//
// Pure data only — imported by the Vite config at build time and by a
// serverless function, so no React, no CSS, no browser globals.
export const COMPANY_DESCRIPTION =
  'RankedTag is an SEO, AI SEO, AEO and GEO agency for B2B SaaS, ecommerce, local, healthcare, law firms and home services. Founded 2026, based in Nepal.';
