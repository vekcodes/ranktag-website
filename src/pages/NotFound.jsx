import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

const TOOLS = [
  { to: '/domain-authority-checker', label: 'Domain Authority Checker' },
  { to: '/keyword-density-checker', label: 'Keyword Density Checker' },
  { to: '/page-speed-checker', label: 'Page Speed Checker' },
  { to: '/competitor-analysis', label: 'Competitor Analysis' },
];

export default function NotFound() {
  usePageMeta({
    title: '404 — Page Not Found · RankedTag',
    description: 'The page you are looking for does not exist or has moved.',
  });

  // The SPA shell is served with HTTP 200 for any unknown path, so this is a
  // "soft" 404 — tell crawlers not to index it. Removed on unmount so it never
  // leaks onto a real page during client-side navigation.
  useEffect(() => {
    const tag = document.createElement('meta');
    tag.name = 'robots';
    tag.content = 'noindex, follow';
    document.head.appendChild(tag);
    return () => tag.remove();
  }, []);

  return (
    <>
      <Nav />
      <main
        className="container"
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '120px 0 80px',
        }}
      >
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(64px, 14vw, 140px)',
            fontWeight: 700,
            lineHeight: 1,
            color: 'var(--red)',
            letterSpacing: '-0.04em',
          }}
        >
          404
        </p>
        <h1 style={{ marginTop: '16px', fontSize: 'clamp(24px, 4vw, 36px)', color: 'var(--ink)' }}>
          This page took a wrong turn.
        </h1>
        <p style={{ marginTop: '12px', maxWidth: '46ch', color: 'var(--muted)', fontSize: '17px' }}>
          The link may be broken, or the page may have moved. Let&rsquo;s get you back on track.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '32px' }}>
          <Link to="/" className="btn btn-primary btn-lg">
            Back home <span className="ar">↗</span>
          </Link>
          <a href="/blog" className="btn btn-outline btn-lg">
            Read the blog <span className="ar">↗</span>
          </a>
        </div>

        <div style={{ marginTop: '56px', width: '100%', maxWidth: '560px' }}>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--muted-2)',
              marginBottom: '16px',
            }}
          >
            Or try a free tool
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {TOOLS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--r-pill)',
                  border: '1px solid var(--paper-3)',
                  background: 'var(--paper-2)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
