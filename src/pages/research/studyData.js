// Head meta and FAQs for the first-party signup attribution dataset.
//
// Every count in the study, including the ones inside the FAQ answers, is
// computed from the SIGNUPS array in the page component. Nothing numeric lives
// here: a count typed into a second file drifts from the data it describes,
// which is the one thing this page cannot afford.
//
// Pure data only — imported by the Vite config at build time via routeMeta.js.
import { SITE } from '../whatWeDo/capabilitiesData.js';

export { SITE };

export const STUDY_UPDATED = '2026-10-19';
export const STUDY_UPDATED_HUMAN = '19 October 2026';

export const STUDY_META = {
  title: 'AI Signup Attribution: A 17-Alert First-Party Sample',
  description:
    'First-party data from one B2B SaaS engagement: the sources recorded against 17 production signups, including named AI assistants, with every limit stated.',
  canonical: `${SITE}/research/results/ai-assistant-signup-attribution`,
};
