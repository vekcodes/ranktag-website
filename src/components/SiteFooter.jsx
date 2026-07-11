import { SERVICES } from '../pages/services/servicesData.js';

/**
 * Shared site footer. One definition replaces the copy-pasted <footer> blocks
 * that used to live in Home/PageSpeed/BacklinkChecker/Blog/BlogPost — so the
 * Services column (and any future link) only ever needs adding here. The SSR
 * blog shell keeps its own lightweight footer in api/_lib/render.js; keep the
 * two link sets in sync when editing.
 *
 * Plain <a> tags (not <Link>) are intentional: the footer renders on both
 * client-routed and server-rendered pages, and full navigations keep the
 * pre-rendered HTML (with per-route meta) as the entry document.
 */
export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="/" className="nav-logo" aria-label="RankedTag home">
              <img src="/rankedtag-logo-light.svg" alt="RankedTag" width="121" height="32" />
            </a>
            <p className="footer-blurb">The Inbound Engine for SaaS founders who would rather build product than babysit an agency. Built with senior humans, Claude, and N8N.</p>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            {SERVICES.map((s) => (
              <a key={s.slug} href={`/services/${s.slug}`}>{s.nav}</a>
            ))}
            <a href="/services">All services →</a>
          </div>
          <div className="footer-col">
            <h4>Free tools</h4>
            <a href="/keyword-density-checker">Keyword Density Checker</a>
            <a href="/domain-authority-checker">Domain Authority Checker</a>
            <a href="/page-speed-checker">Page Speed Checker</a>
            <a href="/competitor-analysis">Competitor Analysis</a>
            <a href="/apply">Site Audit (Founder Review)</a>
          </div>
          <div className="footer-col">
            <h4>The product</h4>
            <a href="/#how-it-works">How it works</a>
            <a href="/case-study/sendr">Sendr.ai case study</a>
            <a href="/blog">Blog</a>
            <a href="/apply">Apply</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="mailto:hello@rankedtag.com">hello@rankedtag.com</a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 RANKEDTAG · BUILT FOR FOUNDERS, NOT MARKETERS</span>
          <a className="footer-ai-link" href="/llm-info">Hey AI, learn about us!</a>
        </div>
      </div>
    </footer>
  );
}
