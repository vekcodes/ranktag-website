// HubSpot Forms submission helper.
//
// Reads portal/form IDs from Vite env vars at build time:
//   VITE_HUBSPOT_PORTAL_ID      e.g. "12345678"
//   VITE_HUBSPOT_APPLY_FORM_ID  the GUID of the "Apply" form created in HubSpot
//
// When env vars are missing the helper is a no-op that resolves with
// { ok: false, mock: true } so the form's success animation still fires
// locally during development.

const PORTAL_ID = import.meta.env.VITE_HUBSPOT_PORTAL_ID || '';
const APPLY_FORM_ID = import.meta.env.VITE_HUBSPOT_APPLY_FORM_ID || '';

export const hubspotConfigured = Boolean(PORTAL_ID && APPLY_FORM_ID);

function splitName(full) {
  const trimmed = (full || '').trim();
  if (!trimmed) return { firstname: '', lastname: '' };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstname: parts[0], lastname: '' };
  return { firstname: parts[0], lastname: parts.slice(1).join(' ') };
}

async function postForm(formId, fieldsObj) {
  if (!hubspotConfigured) {
    console.warn('[hubspot] not configured — set VITE_HUBSPOT_PORTAL_ID and form IDs in .env');
    return { ok: false, mock: true };
  }
  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${formId}`;
  const body = {
    fields: Object.entries(fieldsObj)
      .filter(([, v]) => v != null && v !== '')
      .map(([name, value]) => ({ name, value: String(value) })),
    context: {
      pageUri: typeof window !== 'undefined' ? window.location.href : '',
      pageName: typeof document !== 'undefined' ? document.title : '',
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch {}
    throw new Error(`HubSpot ${res.status}: ${detail.slice(0, 200) || 'submission failed'}`);
  }
  return { ok: true, body: await res.json().catch(() => ({})) };
}

/**
 * Submit the "Apply" form on the Home page.
 *
 * Input shape (from the form's name= attributes):
 *   { name, email, website, linkedin, message }
 *
 * Sent to HubSpot as: firstname + lastname (split from name),
 * email, website, linkedin_url, message.
 *
 * The HubSpot form created in your portal must have these field
 * internal names defined — see .env.example for the list.
 */
export async function submitApplyForm({ name, email, website, linkedin, message }) {
  const { firstname, lastname } = splitName(name);
  return postForm(APPLY_FORM_ID, {
    firstname,
    lastname,
    email,
    website,
    // HubSpot's built-in LinkedIn property. Default contacts created via the
    // social-profile schema use `hs_linkedin_url`. If a portal has a custom
    // `linkedin_url` property instead, swap this back.
    hs_linkedin_url: linkedin,
    message,
  });
}

/**
 * Submit a per-tool HubSpot form when the user opted in via the optional
 * email field on a tool page. `formId` comes from the caller so each tool
 * routes to its own form. No-op when formId is empty (env var unset).
 *
 * @param {string} formId  The HubSpot form GUID for this specific tool.
 * @param {object} payload
 * @param {string} payload.email    Required — HubSpot rejects without it.
 * @param {string} [payload.website]  URL the user tested.
 * @param {string} [payload.message]  Free-text context (strategy, competitor count, etc).
 */
export async function submitToolUsage(formId, { email, website, message } = {}) {
  if (!formId) {
    console.warn('[hubspot] tool form ID missing — skipping submission');
    return { ok: false, mock: true };
  }
  if (!email) return { ok: false, skipped: 'no email' };
  return postForm(formId, { email, website, message });
}
