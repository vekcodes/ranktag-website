import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SERVICES } from '../pages/services/servicesData.js';

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
 * Full-width mega-menu panel shared by the Services and Free Tools menus.
 * The panel is a sibling of the bar rather than a child of the trigger, so it
 * can span the viewport; only one is open at a time (openId lives in Nav state).
 * <Link> items keep client-side navigation; the parent closes on route change.
 */
function NavMenu({ id, label, items, footerItem, note, openId, setOpenId, active, onNavigate }) {
  const ref = useRef(null);
  const open = openId === id;

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenId(null);
    };
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setOpenId(null);
      ref.current?.querySelector('.nav-menu-toggle')?.focus();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpenId]);

  return (
    <div className={`nav-menu${open ? ' open' : ''}`} ref={ref}>
      <button
        type="button"
        className={`nav-link nav-menu-toggle${active ? ' is-active' : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpenId(open ? null : id)}
      >
        {label}
        <span className="nav-menu-caret" aria-hidden="true" />
      </button>

      <div className="nav-mega" role="region" aria-label={label} hidden={!open}>
        <div className="nav-mega-inner container">
          <div className="nav-mega-aside">
            <span className="eyebrow bracket">{label}</span>
            {note && <p className="nav-mega-note">{note}</p>}
            {footerItem && (
              <Link to={footerItem.to} className="nav-mega-all link-wipe" onClick={onNavigate}>
                {footerItem.label}
              </Link>
            )}
          </div>

          <ul className="nav-mega-grid" data-cols={items.length % 3 === 0 ? 3 : 2}>
            {items.map((t, i) => (
              <li key={t.to}>
                <Link to={t.to} className="nav-mega-item ar-parent" onClick={onNavigate}>
                  <span className="idx">{String(i + 1).padStart(3, '0')}</span>
                  <span className="nav-mega-item-label">{t.label}</span>
                  <span className="nav-mega-item-desc">{t.desc}</span>
                  <span className="nav-mega-item-go ar" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Nav({ variant = 'home' }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const location = useLocation();

  // A sentinel pinned to the top of the document rather than a scroll
  // listener: the observer fires twice per page (crossing out, crossing back)
  // instead of on every frame of every scroll.
  useEffect(() => {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
    document.body.appendChild(sentinel);

    const io = new IntersectionObserver(
      ([e]) => setScrolled(!e.isIntersecting),
      { threshold: 0 }
    );
    io.observe(sentinel);
    return () => { io.disconnect(); sentinel.remove(); };
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
      className={`nav${scrolled ? ' scrolled' : ''}${open ? ' menu-open' : ''}${openId ? ' mega-open' : ''}`}
      id="nav"
    >
      <div className="scroll-progress" aria-hidden="true" />
      <div className="nav-bar">
        <Link to="/" className="nav-logo" onClick={close} aria-label="RankedTag home">
          <img
            src="/rankedtag-logo-light.svg"
            alt="RankedTag — SEO, AI SEO & GEO agency for B2B SaaS"
            width="106"
            height="28"
          />
        </Link>

        <div className="nav-links">
          <NavMenu
            id="services"
            label="Services"
            items={serviceItems}
            footerItem={{ to: '/services', label: 'All services →' }}
            note="One engine, six disciplines."
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
            className={`nav-link${isHome ? ' has-badge' : ''}${isAudit ? ' is-active' : ''}`}
            onClick={close}
          >
            Founder Review
            {isHome && <span className="badge">FREE</span>}
          </Link>

          <NavMenu
            id="tools"
            label="Free Tools"
            items={FREE_TOOLS}
            footerItem={{ to: '/#free-seo-tools', label: 'See all free tools →' }}
            note="Built in-house. No sign-up."
            openId={openId}
            setOpenId={setOpenId}
            active={isTech}
            onNavigate={close}
          />

          <Link to="/apply" className="nav-link nav-link-cta-mobile" onClick={close}>
            Apply for the engine →
          </Link>
        </div>

        <Link to="/apply" className="nav-cta ar-parent">
          Apply <span className="ar" aria-hidden="true">→</span>
        </Link>

        <button
          className="nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
        </button>
      </div>
    </nav>
  );
}
