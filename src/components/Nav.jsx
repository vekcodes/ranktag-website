import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SERVICES } from '../pages/services/servicesData.js';

const ACTIVE_STYLE = { background: 'var(--paper-2)', color: 'var(--ink)' };

const FREE_TOOLS = [
  {
    to: '/keyword-density-checker',
    label: 'Keyword Density Checker',
    desc: 'Live 1-, 2-, 3-word density · CSV export',
  },
  {
    to: '/domain-authority-checker',
    label: 'Domain Authority Checker',
    desc: 'Tranco rank · Wayback age · on-page signals',
  },
  {
    to: '/page-speed-checker',
    label: 'Page Speed Checker',
    desc: 'TTFB, transport, render-blocking · no PSI key',
  },
  {
    to: '/competitor-analysis',
    label: 'Competitor Analysis',
    desc: 'Side-by-side scoring · keyword gaps · insights',
  },
];

/**
 * Hover/click dropdown shared by the Services and Free Tools menus. <Link>
 * items keep client-side navigation; the parent closes everything on route
 * change. Only one dropdown is open at a time (openId lives in Nav state).
 */
function NavDropdown({ id, label, items, footerItem, openId, setOpenId, active, onNavigate }) {
  const ref = useRef(null);
  const open = openId === id;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpenId]);

  return (
    <div className={`nav-dropdown${open ? ' open' : ''}`} ref={ref}>
      <button
        type="button"
        className="nav-link nav-dropdown-toggle"
        style={active ? ACTIVE_STYLE : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpenId(open ? null : id)}
      >
        {label}
        <span className="nav-dropdown-caret" aria-hidden="true">▾</span>
      </button>
      <div className="nav-dropdown-menu" role="menu">
        {items.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            role="menuitem"
            className="nav-dropdown-item"
            onClick={onNavigate}
          >
            <span className="nav-dropdown-item-label">{t.label}</span>
            <span className="nav-dropdown-item-desc">{t.desc}</span>
          </Link>
        ))}
        {footerItem && (
          <>
            <div className="nav-dropdown-divider" />
            <Link
              to={footerItem.to}
              role="menuitem"
              className="nav-dropdown-item nav-dropdown-item-meta"
              onClick={onNavigate}
            >
              {footerItem.label}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function Nav({ variant = 'home' }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setOpenId(null); }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isAudit = variant === 'audit';
  const isTech = variant === 'tech';
  const isHome = variant === 'home';

  const close = () => { setOpen(false); setOpenId(null); };

  const serviceItems = SERVICES.map((s) => ({
    to: `/services/${s.slug}`,
    label: s.nav,
    desc: s.navDesc,
  }));

  return (
    <nav
      className={`nav${scrolled ? ' scrolled' : ''}${open ? ' menu-open' : ''}`}
      id="nav"
    >
      <Link to="/" className="nav-logo" onClick={close} aria-label="RankedTag home">
        <img
          src="/rankedtag-logo.svg"
          alt="RankedTag — SEO, AI SEO & GEO agency for B2B SaaS"
          width="106"
          height="28"
        />
      </Link>
      <div className="nav-links">
        <NavDropdown
          id="services"
          label="Services"
          items={serviceItems}
          footerItem={{ to: '/services', label: 'All services →' }}
          openId={openId}
          setOpenId={setOpenId}
          active={location.pathname.startsWith('/services')}
          onNavigate={close}
        />
        <Link to="/#how-it-works" className="nav-link" onClick={close}>How it works</Link>
        <Link to="/#case-study" className="nav-link" onClick={close}>Sendr.ai story</Link>
        {/* /blog is server-rendered for SEO — real navigation, not client routing */}
        <a href="/blog" className="nav-link" onClick={close}>Blog</a>
        <Link
          to="/apply"
          className={`nav-link${isHome ? ' has-badge' : ''}`}
          style={isAudit ? ACTIVE_STYLE : undefined}
          onClick={close}
        >
          Founder Review
          {isHome && <span className="badge">FREE</span>}
        </Link>

        <NavDropdown
          id="tools"
          label="Free Tools"
          items={FREE_TOOLS}
          footerItem={{ to: '/#free-seo-tools', label: 'See all free tools →' }}
          openId={openId}
          setOpenId={setOpenId}
          active={isTech}
          onNavigate={close}
        />

        <Link to="/apply" className="nav-link nav-link-cta-mobile" onClick={close}>
          Apply for the engine →
        </Link>
      </div>
      <Link to="/apply" className="nav-cta">
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
