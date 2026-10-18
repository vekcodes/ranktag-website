import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import JsonLd from '../../components/JsonLd.jsx';
import { softwareTool, breadcrumb, faqPage, SITE } from '../../lib/schema.js';
import { TOOL_META } from '../../seo/routeMeta.js';
import '../ToolPage.css';
import '../../components/seo/toolGuide.css';
import './tools.css';

// Five types, chosen because they cover most of what a business site actually
// needs and because each one is commonly implemented wrongly in a specific way
// the form can prevent. Everything runs in the browser; nothing is submitted.
const TYPES = {
  Organization: {
    label: 'Organization',
    blurb: 'Sitewide identity. One per site, usually on the homepage.',
    fields: [
      ['name', 'Organisation name', 'RankedTag', true],
      ['url', 'Homepage URL', 'https://example.com', true],
      ['logo', 'Logo URL', 'https://example.com/logo.png', false],
      ['description', 'Short description', 'What the organisation does, in one sentence.', false],
      ['email', 'Contact email', 'hello@example.com', false],
      ['sameAs', 'Profile URLs, one per line', 'https://www.linkedin.com/company/example', false, 'list'],
    ],
    build: (f) => clean({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: f.name,
      url: f.url,
      logo: f.logo || undefined,
      description: f.description || undefined,
      email: f.email || undefined,
      sameAs: lines(f.sameAs),
    }),
  },
  LocalBusiness: {
    label: 'LocalBusiness',
    blurb: 'A business with a physical location or service area.',
    fields: [
      ['name', 'Business name', 'Example Plumbing', true],
      ['url', 'Website URL', 'https://example.com', true],
      ['telephone', 'Phone', '+44 20 1234 5678', false],
      ['street', 'Street address', '1 Example Street', false],
      ['locality', 'Town or city', 'Manchester', false],
      ['region', 'County or state', 'Greater Manchester', false],
      ['postcode', 'Postcode', 'M1 1AA', false],
      ['country', 'Country code', 'GB', false],
      ['areaServed', 'Areas served, one per line', 'Manchester', false, 'list'],
      ['priceRange', 'Price range', '££', false],
    ],
    build: (f) => clean({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: f.name,
      url: f.url,
      telephone: f.telephone || undefined,
      priceRange: f.priceRange || undefined,
      address: f.street || f.locality || f.postcode ? clean({
        '@type': 'PostalAddress',
        streetAddress: f.street || undefined,
        addressLocality: f.locality || undefined,
        addressRegion: f.region || undefined,
        postalCode: f.postcode || undefined,
        addressCountry: f.country || undefined,
      }) : undefined,
      areaServed: lines(f.areaServed),
    }),
  },
  Service: {
    label: 'Service',
    blurb: 'A service you sell, on the page that describes it.',
    fields: [
      ['name', 'Service name', 'Technical SEO', true],
      ['providerName', 'Provider name', 'RankedTag', true],
      ['providerUrl', 'Provider URL', 'https://example.com', false],
      ['description', 'Description', 'What the service includes, in one or two sentences.', false],
      ['serviceType', 'Service type', 'Search Engine Optimization', false],
      ['areaServed', 'Area served', 'Worldwide', false],
      ['url', 'Page URL', 'https://example.com/services/example', false],
    ],
    build: (f) => clean({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: f.name,
      serviceType: f.serviceType || undefined,
      description: f.description || undefined,
      url: f.url || undefined,
      areaServed: f.areaServed ? { '@type': 'Place', name: f.areaServed } : undefined,
      provider: clean({
        '@type': 'Organization',
        name: f.providerName,
        url: f.providerUrl || undefined,
      }),
    }),
  },
  Product: {
    label: 'Product',
    blurb: 'A product. Keep availability and price accurate or drop them.',
    fields: [
      ['name', 'Product name', 'Example Widget', true],
      ['description', 'Description', 'What it is, in one or two sentences.', false],
      ['image', 'Image URL', 'https://example.com/widget.jpg', false],
      ['sku', 'SKU', 'SKU-001', false],
      ['brand', 'Brand', 'Example', false],
      ['price', 'Price', '49.99', false],
      ['currency', 'Currency code', 'GBP', false],
      ['availability', 'Availability', 'InStock', false, 'availability'],
      ['url', 'Product page URL', 'https://example.com/products/widget', false],
    ],
    build: (f) => clean({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: f.name,
      description: f.description || undefined,
      image: f.image || undefined,
      sku: f.sku || undefined,
      brand: f.brand ? { '@type': 'Brand', name: f.brand } : undefined,
      offers: f.price ? clean({
        '@type': 'Offer',
        price: f.price,
        priceCurrency: f.currency || undefined,
        availability: f.availability ? `https://schema.org/${f.availability}` : undefined,
        url: f.url || undefined,
      }) : undefined,
    }),
  },
  FAQPage: {
    label: 'FAQPage',
    blurb: 'Questions and answers. Every one must be visible on the page.',
    fields: [['faqs', 'One per line, question then answer separated by a pipe', 'How long does it take?|About six weeks.', true, 'faqs']],
    build: (f) => clean({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: lines(f.faqs)
        .map((row) => row.split('|'))
        .filter((p) => p[0]?.trim() && p[1]?.trim())
        .map(([q, a]) => ({
          '@type': 'Question',
          name: q.trim(),
          acceptedAnswer: { '@type': 'Answer', text: a.trim() },
        })),
    }),
  },
};

const AVAILABILITY = ['InStock', 'OutOfStock', 'PreOrder', 'BackOrder', 'Discontinued'];

const lines = (v) => {
  const out = (v || '').split('\n').map((x) => x.trim()).filter(Boolean);
  return out.length ? out : undefined;
};

// Drop empty values rather than emitting nulls: a property with no value is
// worse than an absent one, because validators flag it and models read it.
function clean(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) continue;
    out[k] = v;
  }
  return out;
}

const FAQ = [
  [
    'What is schema markup and do I need it?',
    'Schema markup is structured data added to a page so machines can read what it describes rather than inferring it from prose. It can make a page eligible for rich results and it helps search engines and assistants resolve entities. It is not a ranking factor in itself, and adding it to a weak page will not make the page rank.',
  ],
  [
    'Does schema markup improve rankings?',
    'Not directly. It makes pages eligible for certain result types and it helps machines understand what a page is about, both of which can affect how your page appears and how often it is chosen. Treat it as a clarity and eligibility mechanism rather than a lever you pull for position.',
  ],
  [
    'Do I need special markup to appear in AI Overviews?',
    'No. Google states plainly that there are no additional requirements to appear in AI Overviews or AI Mode, and no special optimisations necessary. Valid schema helps for the ordinary reason that it makes content machine-readable, but there is no AI-specific schema type, and anyone charging you to implement one is charging for a file.',
  ],
  [
    'Where should the JSON-LD go on the page?',
    'In a script tag with type application/ld+json, anywhere in the head or body. JSON-LD is Google’s recommended format precisely because it sits apart from your markup and does not need to be woven through the HTML. Keep one block per logical entity rather than merging unrelated types into a single object.',
  ],
  [
    'Does FAQ schema still get rich results?',
    'Far less often than it used to. Google substantially reduced FAQ rich results in search, so adding FAQPage markup in the expectation of visible stars and dropdowns will usually disappoint. It remains useful as machine-readable question-and-answer content, which is a different and more durable reason to have it.',
  ],
  [
    'What is the most common schema mistake?',
    'Markup that does not match the visible page. Google requires structured data to represent content that is actually on the page, so FAQ markup for questions a visitor cannot see, or a price in markup that differs from the price displayed, is a violation rather than an optimisation. The second most common is markup that was accurate at launch and has since gone stale.',
  ],
  [
    'Should product markup be generated from my feed?',
    'On any catalogue of real size, yes. Price and availability change constantly, and markup written once by hand is wrong within days. Generating it from the same source as the displayed data is the only way to keep the two in agreement, and disagreement between them is exactly what breaks rich result eligibility.',
  ],
  [
    'How do I check my markup is valid?',
    'Use Google’s Rich Results Test for eligibility and the Schema.org validator for correctness, then check Search Console for errors reported on live pages. The three answer different questions: whether Google can use it, whether it is well-formed, and whether anything broke after deployment.',
  ],
  [
    'Can I put several schema types on one page?',
    'Yes, and often you should. A service page might carry Service, BreadcrumbList and FAQPage. Keep them as separate top-level objects or as an array rather than nesting unrelated types inside each other, and make sure each describes something genuinely present on that page.',
  ],
];

const PAGE_URL = `${SITE}/schema-generator`;
const JSONLD = [
  softwareTool({
    name: 'RankedTag Schema Markup Generator',
    url: PAGE_URL,
    description:
      'Free JSON-LD schema generator for Organization, LocalBusiness, Service, Product and FAQPage. Empty fields are dropped rather than emitted as nulls. Runs entirely in your browser.',
    featureList: [
      'Organization, LocalBusiness, Service, Product and FAQPage',
      'Valid JSON-LD output, ready to paste',
      'Empty properties dropped automatically',
      'Copy or download the script tag',
      'Runs entirely client-side — nothing is sent anywhere',
    ],
  }),
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Schema Generator', item: PAGE_URL },
  ]),
  faqPage(FAQ),
];

export default function SchemaGenerator() {
  useScrollReveal();
  usePageMeta(TOOL_META['/schema-generator']);

  useEffect(() => {
    const handler = (ev) => {
      const q = ev.target.closest('.faq-q');
      if (!q) return;
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const [type, setType] = useState('Organization');
  const [values, setValues] = useState({});
  const [status, setStatus] = useState('');

  const cfg = TYPES[type];
  const f = values[type] || {};
  const set = (k, v) => setValues((s) => ({ ...s, [type]: { ...(s[type] || {}), [k]: v } }));

  const json = useMemo(() => {
    try {
      return JSON.stringify(cfg.build(f), null, 2);
    } catch {
      return '{}';
    }
  }, [cfg, f]);

  const snippet = `<script type="application/ld+json">\n${json}\n</script>`;
  const missing = cfg.fields.filter(([k, , , required]) => required && !f[k]?.trim()).map(([, label]) => label);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setStatus('Copied the script tag to your clipboard.');
    } catch {
      setStatus('Copying was blocked. Select the code and copy it manually.');
    }
  };

  const download = () => {
    const blob = new Blob([snippet], { type: 'application/ld+json' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `${type.toLowerCase()}-schema.html`;
    a.click();
    setStatus('Downloaded.');
  };

  return (
    <>
      <JsonLd data={JSONLD} />
      <Nav variant="tech" />

      <main>
        <section className="tool-hero">
          <div className="tool-hero-bg" />
          <div className="container tool-hero-inner">
            <span className="eyebrow bracket tool-eyebrow">★ FREE TOOL · RUNS IN YOUR BROWSER</span>
            <h1>
              Schema Generator.<br />
              <span className="ser">Valid JSON-LD,</span><br />
              <span className="accent">without the empty properties.</span>
            </h1>
            <p>
              Five types that cover most of what a business site needs: Organization, LocalBusiness,
              Service, Product and FAQPage. Blank fields are dropped rather than emitted as nulls, because
              a property with no value is worse than one that is simply absent. Nothing is sent anywhere.
            </p>
          </div>
        </section>

        <section className="ct-section">
          <div className="container">
            <div className="ct-row" style={{ marginBottom: 'var(--s-6)' }} role="group" aria-label="Schema type">
              {Object.entries(TYPES).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  className="ct-btn"
                  aria-pressed={type === k}
                  onClick={() => { setType(k); setStatus(''); }}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="ct-grid">
              <div className="ct-panel">
                <h2 className="ct-panel-h">{cfg.label} — {cfg.blurb}</h2>
                {cfg.fields.map(([key, label, placeholder, required, kind]) => (
                  <div className="ct-field" key={key}>
                    <label className="ct-label" htmlFor={`sg-${key}`}>
                      {label}{required ? ' *' : ''}
                    </label>
                    {kind === 'availability' ? (
                      <select
                        id={`sg-${key}`}
                        className="ct-select"
                        value={f[key] || ''}
                        onChange={(e) => set(key, e.target.value)}
                      >
                        <option value="">Not set</option>
                        {AVAILABILITY.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    ) : kind === 'list' || kind === 'faqs' ? (
                      <textarea
                        id={`sg-${key}`}
                        className="ct-textarea"
                        placeholder={placeholder}
                        value={f[key] || ''}
                        onChange={(e) => set(key, e.target.value)}
                      />
                    ) : (
                      <input
                        id={`sg-${key}`}
                        className="ct-input"
                        placeholder={placeholder}
                        value={f[key] || ''}
                        onChange={(e) => set(key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                {missing.length > 0 && (
                  <p className="ct-hint">Still needed: {missing.join(', ')}.</p>
                )}
              </div>

              <div className="ct-output">
                <div className="ct-output-head">
                  <span className="ct-panel-h" style={{ margin: 0 }}>Paste this into your page</span>
                  <span className="ct-row">
                    <button type="button" className="ct-btn ct-btn-primary" onClick={copy}>Copy</button>
                    <button type="button" className="ct-btn" onClick={download}>Download</button>
                  </span>
                </div>
                <pre className="ct-code" aria-label="Generated JSON-LD"><code>{snippet}</code></pre>
                <p className="ct-status" role="status" style={{ padding: '0 var(--s-5) var(--s-4)' }}>
                  {status}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="what-it-does">What schema actually does, and what it does not</h2>
                <p>
                  Structured data tells a machine what a page describes rather than leaving it to infer that
                  from the prose. It is the difference between a page that mentions a price somewhere in a
                  paragraph and a page that states, in a form a parser can read without ambiguity, that this
                  product costs this amount in this currency and is currently in stock.
                </p>
                <p>
                  What it does is make you eligible for result types that need that certainty, and help
                  search engines and assistants resolve which entity you are. What it does not do is improve
                  a page that is otherwise weak. Markup is a clarity mechanism, not a ranking lever, and
                  adding it to thin content produces thin content that is easier to parse.
                </p>
                <p>
                  It is also worth being precise about AI search, because this is where most of the current
                  selling happens. Google states that there are no additional requirements to appear in AI
                  Overviews or AI Mode and no special optimisations necessary. There is no AI schema type. A
                  proposal that includes one as a line item is charging you for a file.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="rules">The two rules that cause most of the problems</h2>
                <p>
                  <strong>It must match the visible page.</strong> Structured data is supposed to represent
                  content a visitor can actually see. FAQ markup for questions that are not on the page, a
                  review score that appears nowhere, or a price in markup that differs from the displayed
                  price are all violations rather than clever optimisations. This is the single most common
                  problem we find, and it is usually accidental.
                </p>
                <p>
                  <strong>It must stay true.</strong> Markup written once at launch is correct for about as
                  long as nothing changes. Prices move, stock runs out, opening hours change, staff leave. On
                  a catalogue of any size, the only sustainable approach is generating structured data from
                  the same source as the displayed content, so the two cannot disagree.
                </p>
                <p>
                  A third rule follows from both: delete markup you cannot maintain. Absent structured data
                  costs you an eligibility you might not have used. Wrong structured data actively
                  contradicts your own page.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="which-type">Which type to use where</h2>
                <p>
                  <strong>Organization</strong> is your sitewide identity and belongs once, usually on the
                  homepage. Its real value is the <code>sameAs</code> list: the profiles that let a machine
                  connect your site to everywhere else you appear. That connection is most of what entity
                  resolution means in practice.
                </p>
                <p>
                  <strong>LocalBusiness</strong> replaces Organization where there is a physical location or
                  a defined service area. The address and area served are the properties that matter; the
                  rest is decoration. Keep them identical to what your Google Business Profile and your
                  directory listings say, because disagreement between sources is what makes a business hard
                  to resolve.
                </p>
                <p>
                  <strong>Service</strong> goes on the page describing that service, with a provider that
                  references your Organization. One per page, matching the page, rather than a list of
                  everything you offer repeated on every page.
                </p>
                <p>
                  <strong>Product</strong> is where accuracy matters most, because price and availability are
                  checked and used. Generate it from your feed. If you cannot, consider omitting price and
                  availability rather than publishing figures that will be wrong by Thursday.
                </p>
                <p>
                  <strong>FAQPage</strong> is worth including for machine readability even though Google has
                  substantially reduced FAQ rich results in search. Every question must be visible on the
                  page. If you want the version of this argument that applies to being quoted by assistants,
                  it is in <Link to="/what-we-do/answer-engine-optimization">answer engine optimisation</Link>.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="validate">After you paste it in</h2>
                <p>
                  Three checks, answering three different questions. Google’s Rich Results Test tells you
                  whether Google can use the markup for a result type. The Schema.org validator tells you
                  whether it is well-formed and whether you have used properties correctly. Search Console
                  tells you whether anything broke on live pages after deployment, which is the one most
                  teams forget to look at.
                </p>
                <p>
                  Then set a reminder to check again in three months. Structured data decays silently: no
                  error appears when a price becomes wrong, and nothing visibly breaks when a staff member
                  named in your markup leaves. It simply stops being true, which is the state that costs you
                  the eligibility it was added to earn.
                </p>
              </section>
            </article>
          </div>
        </section>

        <section className="faq-section ruled" data-reveal>
          <div className="container grid12">
            <div className="col-4 faq-aside">
              <span className="eyebrow" data-num="001">FAQ</span>
              <h2 className="h-2 faq-h">Schema markup, asked and answered.</h2>
              <div className="faq-side">
                <h3>Want your whole schema graph checked?</h3>
                <p>
                  Send the domain. The founder reviews it personally, including whether your structured data
                  still agrees with your pages, and replies within 48 hours.
                </p>
                <Link to="/apply" className="btn btn-red w-full ar-parent">
                  Apply for review <span className="ar-ne">↗</span>
                </Link>
              </div>
            </div>
            <div className="col-7 start-6 faq-list">
              {FAQ.map(([q, a], i) => (
                <div className="faq-item" key={q}>
                  <h3 className="faq-h3">
                    <button type="button" className="faq-q" aria-expanded="false">
                      <span className="faq-n" aria-hidden="true">{String(i + 1).padStart(3, '0')}</span>
                      <span className="faq-qt">{q}</span>
                      <span className="faq-ic" aria-hidden="true">+</span>
                    </button>
                  </h3>
                  <div className="faq-a"><div className="faq-a-inner">{a}</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
