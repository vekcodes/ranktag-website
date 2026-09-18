import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { submitStrategyCall } from '../../lib/hubspot.js';
import { identifyVisitor } from '../../lib/track.js';
import './entryOffer.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

function normalizeUrl(raw) {
  const v = (raw || '').trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Bare hostname, for the success-state hand-off into the free tools. */
function hostOf(raw) {
  try {
    return new URL(normalizeUrl(raw)).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

/**
 * The popup body. Lazy-loaded by EntryOffer, so this module and its stylesheet
 * only reach visitors who actually see it.
 *
 * Two states: the ask (site + email → HubSpot) and the confirmation, which
 * hands the visitor straight into the free authority checker with their own
 * domain pre-filled rather than dead-ending on "thanks".
 */
export default function OfferPanel({ onClose, onConvert }) {
  const panelRef = useRef(null);
  const titleId = useId();
  const dekId = useId();

  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', error: '' });
  const done = state.status === 'success';

  // Escape to close, Tab kept inside the dialog, scroll locked behind it, and
  // focus handed back to wherever it came from on unmount.
  useEffect(() => {
    const panel = panelRef.current;
    const restoreTo = document.activeElement;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;

    // Compensate for the scrollbar the lock removes, or the page jumps 15px.
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;
    body.style.overflow = 'hidden';

    // The panel takes focus rather than the first field: focusing an input
    // here would throw up the software keyboard the instant the popup lands.
    panel?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      restoreTo?.focus?.();
    };
  }, [onClose]);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (state.status === 'submitting') return;
      const cleanEmail = email.trim();
      const cleanSite = normalizeUrl(website);
      setState({ status: 'submitting', error: '' });
      try {
        await submitStrategyCall({
          email: cleanEmail,
          website: cleanSite,
          message: 'Source: Entry popup — 15-minute strategy call',
        });
        // Ties the rest of the session to the contact in HubSpot.
        identifyVisitor({ email: cleanEmail, website: cleanSite });
        setState({ status: 'success', error: '' });
        onConvert();
      } catch (err) {
        setState({ status: 'error', error: err.message || 'That did not send. Try again?' });
      }
    },
    [email, website, state.status, onConvert],
  );

  const host = hostOf(website);
  const busy = state.status === 'submitting';

  return (
    <div className="eo-root">
      <div className="eo-scrim" onClick={onClose} aria-hidden="true" />

      <div
        className="eo-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={dekId}
        tabIndex={-1}
        ref={panelRef}
      >
        <div className="eo-mesh" aria-hidden="true" />
        <span className="eo-scan" aria-hidden="true" />
        {/* The scarcity number as structure, the way the section rails do it. */}
        <span className="eo-numeral" aria-hidden="true">04</span>

        <button type="button" className="eo-close" onClick={onClose} aria-label="Close">
          <span aria-hidden="true">×</span>
        </button>

        <div className="eo-body">
          {done ? (
            <div className="eo-done">
              <span className="eyebrow bracket eo-eyebrow">★ SEAT HELD</span>
              <h2 id={titleId} className="eo-title">
                You are on the list.
                <br />
                <span className="ser">Now go look at</span>
                <br />
                <span className="accent">your own numbers.</span>
              </h2>
              <p id={dekId} className="eo-dek">
                The founder reads every request personally and replies on LinkedIn within 48 hours —
                even when the answer is no. Nothing else lands in your inbox in the meantime.
              </p>
              <div className="eo-done-row">
                <a
                  className="btn btn-primary eo-cta"
                  href={`/domain-authority-checker${host ? `?url=${encodeURIComponent(host)}` : ''}`}
                >
                  Score {host || 'your domain'} now <span className="ar">→</span>
                </a>
                <button type="button" className="btn btn-ghost eo-later" onClick={onClose}>
                  Later
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Kept short enough to hold one line at 320px — the bracket is a
                  flex item, so a wrapped label strands the closing "]". */}
              <span className="eyebrow bracket eo-eyebrow">★ 4 SEATS A MONTH</span>
              <h2 id={titleId} className="eo-title">
                Fifteen minutes.
                <br />
                <span className="ser">One honest read of</span>
                <br />
                <span className="accent">why you are not ranking.</span>
              </h2>
              <p id={dekId} className="eo-dek">
                Tell us where your site lives. The founder pulls it apart before the call and turns up
                with the three things costing you the most traffic — then tells you whether we are the
                ones to fix them, or who is.
              </p>

              <form className="eo-form" onSubmit={onSubmit} noValidate={false}>
                <div className="eo-field">
                  <label className="eo-label" htmlFor="eo-site">Your site</label>
                  <input
                    id="eo-site"
                    name="website"
                    type="text"
                    className="eo-input"
                    placeholder="yoursaas.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="url"
                    disabled={busy}
                    required
                  />
                </div>
                <div className="eo-field">
                  <label className="eo-label" htmlFor="eo-email">Where to reply</label>
                  <input
                    id="eo-email"
                    name="email"
                    type="email"
                    className="eo-input"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={busy}
                    required
                  />
                </div>

                {state.status === 'error' && (
                  <p className="eo-error" role="alert">{state.error}</p>
                )}

                <button type="submit" className="btn btn-primary eo-cta" disabled={busy}>
                  {busy ? 'Sending…' : 'Claim a strategy call'}
                  <span className="ar" aria-hidden="true">→</span>
                </button>
              </form>

              <p className="eo-fine">
                Free, and not a pitch. No SDR, no sequence, no “quick sync” follow-ups.{' '}
                <button type="button" className="eo-decline" onClick={onClose}>
                  I would rather keep reading
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
