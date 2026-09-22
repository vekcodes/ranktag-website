import Nav from '../components/Nav.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import JsonLd from '../components/JsonLd.jsx';
import { breadcrumb } from '../lib/schema.js';
import { AUTHOR, AUTHOR_PERSON } from '../seo/author.js';
import { AUTHOR_META } from '../seo/routeMeta.js';
import './Author.css';

// Author page. Exists so every post's BlogPosting.author can point at a real
// Person with a real URL instead of the organisation — "By RankedTag" on
// advice content is the E-E-A-T weakness this resolves.
const AUTHOR_JSONLD = [
  {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${AUTHOR.url}#webpage`,
    url: AUTHOR.url,
    name: `${AUTHOR.name} — ${AUTHOR.jobTitle}, RankedTag`,
    isPartOf: { '@id': 'https://rankedtag.com/#website' },
    mainEntity: { '@id': `${AUTHOR.url}#person` },
    inLanguage: 'en',
  },
  { '@context': 'https://schema.org', ...AUTHOR_PERSON },
  breadcrumb([
    { name: 'Home', item: 'https://rankedtag.com/' },
    { name: AUTHOR.name, item: AUTHOR.url },
  ]),
];

export default function AuthorPage() {
  usePageMeta(AUTHOR_META);
  return (
    <>
      <Nav />
      <JsonLd data={AUTHOR_JSONLD} />
      <main className="author-wrap">
        <article className="author-card">
          <p className="author-kicker">Author</p>
          <h1 className="author-name">{AUTHOR.name}</h1>
          <p className="author-role">{AUTHOR.jobTitle}, RankedTag</p>

          <div className="author-bio">
            <p>
              Bhushan Raj Shakya is the founder of RankedTag, where he works on
              SEO, generative engine optimization and inbound growth for B2B
              SaaS companies.
            </p>
            <p>
              He writes the field notes published on this blog: what actually
              moves organic pipeline for founder-led SaaS, how AI assistants
              pick which sources to cite, and the technical work that decides
              whether either happens.
            </p>
          </div>

          <ul className="author-links">
            <li>
              <a href={AUTHOR.linkedin} rel="me noopener noreferrer" target="_blank">
                LinkedIn
              </a>
            </li>
            <li><a href="/blog">Articles by {AUTHOR.name.split(' ')[0]}</a></li>
            <li><a href="/apply">Work with RankedTag</a></li>
          </ul>
        </article>
      </main>
    </>
  );
}
