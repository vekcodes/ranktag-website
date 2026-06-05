import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { blogCollection, breadcrumb, SITE } from '../lib/schema.js';
import { blogApi, ApiUnreachableError } from '../lib/blogApi.js';
import './blog.css';

const BLOG_JSONLD = [
  blogCollection({
    description:
      'SEO, generative engine optimization, and inbound growth for B2B SaaS founders.',
  }),
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Blog', item: `${SITE}/blog` },
  ]),
];

// Client-side blog index. In production the SSR function at /api/blog-page
// serves this route (better for SEO); this component is the resilient
// fallback for local `vite` dev and client navigation.
export default function Blog() {
  usePageMeta({
    title: 'Blog · RankedTag — SEO & Inbound for B2B SaaS',
    description:
      'Field notes on SEO, generative engine optimization (GEO), and building inbound engines that generate qualified pipeline for B2B SaaS.',
    canonical: 'https://rankedtag.com/blog',
    jsonLd: BLOG_JSONLD,
  });

  const [state, setState] = useState({ status: 'loading', posts: [] });

  useEffect(() => {
    let alive = true;
    blogApi
      .list(30)
      .then((r) => alive && setState({ status: 'ok', posts: r.posts || [] }))
      .catch((e) =>
        alive &&
        setState({
          status: e instanceof ApiUnreachableError ? 'offline' : 'error',
          posts: [],
        })
      );
    return () => { alive = false; };
  }, []);

  const { status, posts } = state;

  return (
    <div className="blogx">
      <Nav variant="home" />

      <header className="blogx-hero">
        <div className="container">
          <div className="eyebrow">The RankedTag Blog</div>
          <h1 className="h-1">SEO &amp; inbound, written by operators.</h1>
          <p>
            Field notes on search, generative engine optimization, and building
            inbound engines that compound into qualified pipeline.
          </p>
        </div>
      </header>

      <main className="container blogx-main">
        {status === 'loading' && (
          <div className="blogx-grid">
            {[0, 1, 2].map((i) => (
              <div className="blogx-card skeleton" key={i}>
                <div className="sk-img" />
                <div className="sk-line w70" />
                <div className="sk-line w90" />
                <div className="sk-line w40" />
              </div>
            ))}
          </div>
        )}

        {status === 'ok' && posts.length > 0 && (
          <>
            {/* Most-recent post as a full-width featured card. */}
            <a className="blogx-feat" href={`/blog/${posts[0].slug}`}>
              {posts[0].cover_image_url ? (
                <img
                  className="blogx-feat-img"
                  src={posts[0].cover_image_url}
                  alt={posts[0].cover_image_alt || posts[0].title}
                  width="1200"
                  height="630"
                  fetchPriority="high"
                />
              ) : (
                <div className="blogx-feat-img blogx-img-ph" />
              )}
              <div className="blogx-feat-body">
                <span className="blogx-feat-kicker">Latest</span>
                <h2>{posts[0].title}</h2>
                <p>{posts[0].excerpt}</p>
                <span className="blogx-meta">
                  {posts[0].published_at
                    ? new Date(posts[0].published_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })
                    : 'Draft'}{' '}
                  · {posts[0].reading_minutes || 1} min read
                </span>
              </div>
            </a>

            {posts.length > 1 && (
              <div className="blogx-grid">
                {posts.slice(1).map((p) => (
                  <a className="blogx-card" key={p.slug} href={`/blog/${p.slug}`}>
                    {p.cover_image_url ? (
                      <img
                        className="blogx-img"
                        src={p.cover_image_url}
                        alt={p.cover_image_alt || p.title}
                        loading="lazy"
                        width="640"
                        height="336"
                      />
                    ) : (
                      <div className="blogx-img blogx-img-ph" />
                    )}
                    <div className="blogx-body">
                      <h2>{p.title}</h2>
                      <p>{p.excerpt}</p>
                      <span className="blogx-meta">
                        {p.published_at
                          ? new Date(p.published_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })
                          : 'Draft'}{' '}
                        · {p.reading_minutes || 1} min read
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {status === 'ok' && posts.length === 0 && (
          <EmptyState
            icon="✍️"
            title="No posts yet — the engine's warming up"
            body="We're writing the first deep-dives on SEO and generative engine optimization for B2B SaaS. Check back shortly, or get a head start with a free founder review."
          />
        )}

        {status === 'offline' && (
          <EmptyState
            icon="🔌"
            title="Blog API isn't running"
            body="Posts load from the /api functions, which run under `vercel dev`. Start the app with vercel dev (not npm run dev) to see live content here."
          />
        )}

        {status === 'error' && (
          <EmptyState
            icon="⚠️"
            title="Couldn't load posts"
            body="Something went wrong fetching the blog. Please refresh in a moment."
          />
        )}
      </main>

      <section className="blogx-cta">
        <div className="container">
          <h2>Want this engine pointed at your SaaS?</h2>
          <p>0 → 1.05M organic impressions in 6 months for Sendr.ai. Get a free founder-level review of your inbound.</p>
          <Link to="/apply" className="btn btn-primary btn-lg">
            Apply for a free review <span className="ar">↗</span>
          </Link>
        </div>
      </section>

      <footer className="blogx-foot">
        <div className="container">
          © {new Date().getFullYear()} RankedTag ·{' '}
          <Link to="/">Home</Link> · <Link to="/apply">Founder Review</Link> ·{' '}
          <a href="/rss.xml">RSS</a>
        </div>
      </footer>
    </div>
  );
}

function EmptyState({ icon, title, body }) {
  return (
    <div className="blogx-empty">
      <div className="blogx-empty-ic" aria-hidden="true">{icon}</div>
      <h2>{title}</h2>
      <p>{body}</p>
      <Link to="/apply" className="btn btn-red">
        Get a free founder review <span className="ar">↗</span>
      </Link>
    </div>
  );
}
