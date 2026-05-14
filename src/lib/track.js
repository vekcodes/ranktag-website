// Tool-usage tracking.
//
// HubSpot's free tier doesn't expose Custom Behavioral Events, so we use
// the supported workaround: fire a synthetic pageview to a virtual path
// like `/_track/keyword-density?url=...`. HubSpot logs the hit against
// the visitor session and retroactively attaches it to the contact once
// they submit any form on the site.
//
// Designed to be the single tracking entry point — when we wire GA4 next
// it'll fan out from here too.

/**
 * Record that a visitor used a tool.
 *
 * @param {string} tool   Short slug, e.g. 'keyword-density', 'page-speed'.
 * @param {object} [meta] Optional fields. Common: { url, domain }.
 */
export function trackToolUse(tool, meta = {}) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams();
  if (meta.url) params.set('url', meta.url);
  if (meta.domain) params.set('domain', meta.domain);
  for (const [k, v] of Object.entries(meta)) {
    if (k === 'url' || k === 'domain') continue;
    if (v != null && v !== '') params.set(k, String(v));
  }
  const path = `/_track/${tool}${params.toString() ? `?${params}` : ''}`;

  // HubSpot tracking queue — script loader from useHubSpotTracking.js
  // creates `_hsq` lazily. Pushing before the script loads is fine; it
  // drains the queue on init.
  window._hsq = window._hsq || [];
  window._hsq.push(['setPath', path]);
  window._hsq.push(['trackPageView']);
}

/**
 * Tell HubSpot who this visitor is — call after a form submission so
 * future events are attached to the contact, not the anonymous session.
 * Most flows don't need this manually because HubSpot's form submission
 * already identifies the contact; useful for non-HubSpot form flows.
 */
export function identifyVisitor({ email, ...traits } = {}) {
  if (typeof window === 'undefined' || !email) return;
  window._hsq = window._hsq || [];
  window._hsq.push(['identify', { email, ...traits }]);
  window._hsq.push(['trackPageView']);
}
