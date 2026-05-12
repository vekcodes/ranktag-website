import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ACTIVE_STYLE = { background: 'var(--paper-2)', color: 'var(--ink)' };

const FREE_TOOLS = [
  {
    to: '/keyword-density',
    label: 'Keyword Density Checker',
    desc: 'Live 1-, 2-, 3-word density · CSV export',
  },
  {
    to: '/backlink-checker',
    label: 'Domain Authority Checker',
    desc: 'Tranco rank · Wayback age · on-page signals',
  },
  {
    to: '/page-speed',
    label: 'Page Speed Checker',
    desc: 'TTFB, transport, render-blocking · no PSI key',
  },
];

export default function Nav({ variant = 'home' }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const location = useLocation();
  const toolsRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setToolsOpen(false); }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!toolsOpen) return;
    const handler = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [toolsOpen]);

  const isAudit = variant === 'audit';
  const isTech = variant === 'tech';
  const isHome = variant === 'home';

  const close = () => { setOpen(false); setToolsOpen(false); };

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
          to="/#apply"
          className={`nav-link${isHome ? ' has-badge' : ''}`}
          style={isAudit ? ACTIVE_STYLE : undefined}
          onClick={close}
        >
          Founder Review
          {isHome && <span className="badge">FREE</span>}
        </Link>

        <div
          className={`nav-dropdown${toolsOpen ? ' open' : ''}`}
          ref={toolsRef}
        >
          <button
            type="button"
            className="nav-link nav-dropdown-toggle"
            style={isTech ? ACTIVE_STYLE : undefined}
            aria-expanded={toolsOpen}
            aria-haspopup="menu"
            onClick={() => setToolsOpen((v) => !v)}
          >
            Free Tools
            <span className="nav-dropdown-caret" aria-hidden="true">▾</span>
          </button>
          <div className="nav-dropdown-menu" role="menu">
            {FREE_TOOLS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                role="menuitem"
                className="nav-dropdown-item"
                onClick={close}
              >
                <span className="nav-dropdown-item-label">{t.label}</span>
                <span className="nav-dropdown-item-desc">{t.desc}</span>
              </Link>
            ))}
            <div className="nav-dropdown-divider" />
            <Link
              to="/#tools"
              role="menuitem"
              className="nav-dropdown-item nav-dropdown-item-meta"
              onClick={close}
            >
              See all free tools →
            </Link>
          </div>
        </div>

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
