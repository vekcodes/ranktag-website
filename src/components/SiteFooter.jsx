import { SERVICES } from '../pages/whatWeDo/capabilitiesData.js';
import { VERTICALS } from '../pages/verticals/verticalsData.js';
import { EXPLAINERS } from '../pages/explainers/explainersData.js';
import { AUTHOR } from '../seo/author.js';

/**
 * Shared site footer. One definition replaces the copy-pasted <footer> blocks
 * that used to live in Home/PageSpeed/BacklinkChecker/Blog/BlogPost — so the
 * What-we-do column (and any future link) only ever needs adding here. The SSR
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
          <div className="footer-brand">
            <a href="/" className="nav-logo" aria-label="RankedTag home">
              <img src="/rankedtag-logo-light.svg" alt="RankedTag" width="121" height="32" />
            </a>
            <p className="footer-blurb">The inbound engine for founders who would rather run the business than babysit an agency. Built with senior humans, Claude, and N8N.</p>
          </div>
          <div className="footer-col">
            <h4><span className="idx plain">001</span>What we do</h4>
            {SERVICES.map((s) => (
              <a key={s.slug} href={`/what-we-do/${s.slug}`} className="link-wipe">{s.nav}</a>
            ))}
            <a href="/what-we-do" className="link-wipe">All capabilities →</a>
          </div>
          <div className="footer-col">
            <h4><span className="idx plain">002</span>Who we help</h4>
            {VERTICALS.map((v) => (
              <a key={v.slug} href={`/${v.slug}`} className="link-wipe">{v.nav}</a>
            ))}
            <a href="/who-we-help" className="link-wipe">All verticals →</a>
            <a href="/best" className="link-wipe">Agency comparisons →</a>
          </div>
          <div className="footer-col">
            <h4><span className="idx plain">003</span>Guides</h4>
            {EXPLAINERS.map((e) => (
              <a key={e.slug} href={`/${e.slug}`} className="link-wipe">{e.nav}</a>
            ))}
            <a href="/glossary" className="link-wipe">Glossary</a>
          </div>
          <div className="footer-col">
            <h4><span className="idx plain">004</span>Free tools</h4>
            <a href="/schema-generator" className="link-wipe">Schema Generator</a>
            <a href="/serp-preview-tool" className="link-wipe">SERP Preview Tool</a>
            <a href="/llms-txt-generator" className="link-wipe">llms.txt Generator</a>
            <a href="/keyword-density-checker" className="link-wipe">Keyword Density Checker</a>
            <a href="/domain-authority-checker" className="link-wipe">Domain Authority Checker</a>
            <a href="/page-speed-checker" className="link-wipe">Page Speed Checker</a>
            <a href="/competitor-analysis" className="link-wipe">Competitor Analysis</a>
            <a href="/apply" className="link-wipe">Site Audit (Founder Review)</a>
          </div>
          <div className="footer-col">
            <h4><span className="idx plain">005</span>The product</h4>
            <a href="/#how-it-works" className="link-wipe">How it works</a>
            <a href="/case-study/sendr" className="link-wipe">Sendr.ai case study</a>
            <a href="/blog" className="link-wipe">Blog</a>
            <a href="/apply" className="link-wipe">Apply</a>
          </div>
          <div className="footer-col">
            <h4><span className="idx plain">006</span>Company</h4>
            <a href="/about" className="link-wipe">About the founder</a>
            <a href="mailto:hello@rankedtag.com" className="link-wipe">hello@rankedtag.com</a>
            <a href={AUTHOR.linkedin} target="_blank" rel="noreferrer me" className="link-wipe">LinkedIn</a>
          </div>
        </div>

        {/* Decorative wordmark: the accessible brand name already comes from the
            logo image above, so this is hidden from assistive tech. */}
        <div className="footer-wordmark" aria-hidden="true">RANKEDTAG</div>

        <div className="footer-bottom">
          <span>© 2026 RANKEDTAG · BUILT FOR FOUNDERS, NOT MARKETERS</span>
          <a className="footer-ai-link link-wipe" href="/llm-info">Hey AI, learn about us!</a>
        </div>
      </div>
    </footer>
  );
}
