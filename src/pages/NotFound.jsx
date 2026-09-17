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
      <main className="container nf">
        <div className="nf-top">
          <span className="idx" aria-hidden="true">404</span>
        </div>
        <p className="nf-code" aria-hidden="true">404</p>
        <div className="nf-row">
          <h1 className="nf-h">This page took a wrong turn.</h1>
          <p className="nf-sub">
            The link may be broken, or the page may have moved. Let&rsquo;s get you back on track.
          </p>
        </div>

        <div className="nf-ctas">
          <Link to="/" className="btn btn-primary btn-lg ar-parent">
            Back home <span className="ar-ne">↗</span>
          </Link>
          <a href="/blog" className="btn btn-outline btn-lg ar-parent">
            Read the blog <span className="ar-ne">↗</span>
          </a>
        </div>

        <div className="nf-tools">
          <p className="nf-tools-label">Or try a free tool</p>
          <div className="nf-tools-row">
            {TOOLS.map((t) => (
              <Link key={t.to} to={t.to} className="nf-tool link-wipe">
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
