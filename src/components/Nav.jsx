import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ACTIVE_STYLE = { background: 'var(--paper-2)', color: 'var(--ink)' };

export default function Nav({ variant = 'home' }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route or hash change
  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isAudit = variant === 'audit';
  const isTech = variant === 'tech';
  const isHome = variant === 'home';

  const close = () => setOpen(false);

  return (
    <nav
      className={`nav${scrolled ? ' scrolled' : ''}${open ? ' menu-open' : ''}`}
      id="nav"
    >
      <Link to="/" className="nav-logo" onClick={close}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect className="lg-r1" x="30" y="20" width="50" height="50" />
          <rect className="lg-r3" x="20" y="50" width="30" height="30" />
          <rect className="lg-r2" x="40" y="45" width="25" height="20" />
        </svg>
        RankedTag
      </Link>
      <div className="nav-links">
        <Link to="/#mechanism" className="nav-link" onClick={close}>How it works</Link>
        <Link to="/#proof" className="nav-link" onClick={close}>Sendr.ai story</Link>
        <Link
          to="/audit"
          className={`nav-link${isHome ? ' has-badge' : ''}`}
          style={isAudit ? ACTIVE_STYLE : undefined}
          onClick={close}
        >
          Founder Review
          {isHome && <span className="badge">FREE</span>}
        </Link>
        <Link
          to="/#tools"
          className="nav-link"
          style={isTech ? ACTIVE_STYLE : undefined}
          onClick={close}
        >
          Free Tools
        </Link>
        <Link to="/#apply" className="nav-link nav-link-cta-mobile" onClick={close}>
          Apply for the engine →
        </Link>
      </div>
      <Link to="/#apply" className="nav-cta">
        Apply <span>→</span>
      </Link>
      <button
        className="nav-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span></span>
      </button>
    </nav>
  );
}
