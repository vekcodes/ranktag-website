import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// The panel (and its CSS) is a lazy chunk: nothing ships to a visitor who
// never sees the popup, so the pre-rendered pages keep their current payload
// and the first paint is untouched.
const OfferPanel = lazy(() => import('./OfferPanel.jsx'));

const STORAGE_KEY = 'rt:entry-offer';
const DISMISS_DAYS = 30;

// Floor before anything is armed. Keeps the popup out of the LCP window —
// opening it early would paint a full-viewport scrim over the hero and take
// the largest-paint candidate with it.
const ARM_DELAY_MS = 3000;
// Dwell trigger, measured from page entry (so ARM_DELAY_MS + the remainder).
const DWELL_MS = 7000;
const SCROLL_RATIO = 0.35;

// /apply already IS this form, only longer; /admin is the CMS.
const SKIP_PATHS = /^\/(apply|admin)(\/|$)/;

// On the free tools a scan takes 5-10 seconds, so a dwell timer would open the
// popup straight over the result the visitor is waiting for. Those routes keep
// scroll depth and exit intent — both of which mean they have already read it.
const NO_DWELL_PATHS =
  /^\/(domain-authority-checker|keyword-density-checker|page-speed-checker|competitor-analysis)$/;

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Private mode / blocked storage — treat as a first visit rather than
    // suppressing the popup outright.
    return null;
  }
}

function writeState(status) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, at: Date.now() }));
  } catch {}
}

/** Converted visitors never see it again; dismissals go quiet for 30 days. */
function isSuppressed() {
  const s = readState();
  if (!s) return false;
  if (s.status === 'converted') return true;
  return s.status === 'dismissed' && Date.now() - (s.at || 0) < DISMISS_DAYS * 864e5;
}

/**
 * Entry offer — the 15-minute strategy call popup.
 *
 * Mounted once in Layout, so it survives client-side navigation and a visitor
 * only meets it once per journey. Opens on whichever lands first: dwell,
 * scroll depth, or exit intent (pointer leaving through the top edge, which is
 * a desktop-only signal — dwell and scroll carry mobile).
 *
 * Renders nothing on the server and nothing before it fires, so the
 * pre-rendered HTML is unchanged.
 */
export default function EntryOffer() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  // Once per page load, whatever the visitor does afterwards.
  const firedRef = useRef(false);
  const convertedRef = useRef(false);

  const skip = SKIP_PATHS.test(pathname);
  const dwellOk = !NO_DWELL_PATHS.test(pathname);

  useEffect(() => {
    if (skip || firedRef.current || isSuppressed()) return undefined;

    let armed = false;
    const timers = [];

    const cleanup = () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseout', onExitIntent);
    };

    function fire() {
      if (!armed || firedRef.current) return;
      firedRef.current = true;
      cleanup();
      setOpen(true);
    }

    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= SCROLL_RATIO) fire();
    }

    // relatedTarget is null only when the pointer actually left the document;
    // clientY <= 0 narrows that to the top edge, i.e. heading for the tabs.
    function onExitIntent(e) {
      if (e.clientY <= 0 && !e.relatedTarget) fire();
    }

    timers.push(
      setTimeout(() => {
        armed = true;
        window.addEventListener('scroll', onScroll, { passive: true });
        if (window.matchMedia('(pointer: fine)').matches) {
          document.addEventListener('mouseout', onExitIntent);
        }
        if (dwellOk) timers.push(setTimeout(fire, Math.max(0, DWELL_MS - ARM_DELAY_MS)));
      }, ARM_DELAY_MS),
    );

    return cleanup;
  }, [skip, dwellOk]);

  const handleConvert = useCallback(() => {
    convertedRef.current = true;
    writeState('converted');
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    writeState(convertedRef.current ? 'converted' : 'dismissed');
  }, []);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <OfferPanel onClose={handleClose} onConvert={handleConvert} />
    </Suspense>
  );
}
