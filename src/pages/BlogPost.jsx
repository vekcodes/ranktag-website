import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { articlePosting } from '../lib/schema.js';
import { blogApi, ApiUnreachableError } from '../lib/blogApi.js';
import './blog.css';

// Client-side single-post fallback. Production serves this via the SSR
// function (SEO); this keeps the route from going blank in dev / on
// client navigation when the function isn't available.
export default function BlogPost() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: 'loading', post: null });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading', post: null });
    fetch(`/api/blog/posts?slug=${encodeURIComponent(slug)}`, {
      credentials: 'same-origin',
    })
      .then(async (res) => {
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) throw new ApiUnreachableError();
        const body = await res.json();
        if (!res.ok) throw Object.assign(new Error(body.detail), { status: res.status });
        return body.post;
      })
      .then((post) => alive && setState({ status: 'ok', post }))
      .catch((e) =>
        alive &&
        setState({
          status:
            e instanceof ApiUnreachableError
              ? 'offline'
              : e.status === 404
              ? 'notfound'
              : 'error',
          post: null,
        })
      );
    return () => { alive = false; };
  }, [slug]);

  const { status, post } = state;

  // BlogPosting + BreadcrumbList + any author custom JSON-LD, mirroring the
  // SSR route's structured data. Memoised so the meta effect only re-runs
  // when the post actually changes.
  const jsonLd = useMemo(() => (post ? articlePosting(post) : undefined), [post]);

  usePageMeta({
    title: post
      ? `${post.meta_title || post.title} · RankedTag`
      : 'Article · RankedTag',
    description: post ? post.meta_description || post.excerpt : '',
    canonical: post
      ? post.canonical_url || `https://rankedtag.com/blog/${post.slug}`
      : undefined,
    jsonLd,
  });

  return (
    <div className="blogx">
      <Nav variant="home" />

      <main className="container blogx-article">
        <div className="blogx-crumbs">
          <Link to="/">Home</Link> › <Link to="/blog">Blog</Link>
          {post ? ` › ${post.title}` : ''}
        </div>

        {status === 'loading' && (
          <div className="blogx-card skeleton" style={{ marginTop: 24 }}>
            <div className="sk-line w40" />
            <div className="sk-line w90" />
            <div className="sk-img" />
            <div className="sk-line w90" />
            <div className="sk-line w70" />
          </div>
        )}

        {status === 'ok' && post && (
          <article>
            <span className="blogx-kicker">
              {(post.tags && post.tags[0]) || 'Article'}
            </span>
            <h1 className="h-1 blogx-title">{post.title}</h1>
            <div className="blogx-pmeta">
              By {post.author || 'RankedTag'} ·{' '}
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })
                : ''}{' '}
              · {post.reading_minutes || 1} min read
            </div>
            {post.cover_image_url && (
              <img
                className="blogx-cover"
                src={post.cover_image_url}
                alt={post.cover_image_alt || post.title}
                width="1200"
                height="630"
              />
            )}
            <div
              className="blogx-prose"
              dangerouslySetInnerHTML={{ __html: post.content_html }}
            />
            <PostFaqs faqs={post.faqs} />
            <div className="blogx-cta inline">
              <div className="container">
                <h2>Want this engine pointed at your SaaS?</h2>
                <p>Get a free founder-level review of your inbound.</p>
                <Link to="/apply" className="btn btn-primary btn-lg">
                  Apply for a free review <span className="ar">↗</span>
                </Link>
              </div>
            </div>
          </article>
        )}

        {status !== 'loading' && status !== 'ok' && (
          <Fallback status={status} />
        )}
      </main>

      <footer className="blogx-foot">
        <div className="container">
          © {new Date().getFullYear()} RankedTag ·{' '}
          <Link to="/">Home</Link> · <Link to="/blog">Blog</Link>
        </div>
      </footer>
    </div>
  );
}

// Per-post FAQ accordion. Native <details> so it works without JS and matches
// the SSR markup. Renders nothing when the post has no FAQs.
function PostFaqs({ faqs }) {
  const list = Array.isArray(faqs) ? faqs.filter((f) => f && f.q && f.a) : [];
  if (!list.length) return null;
  return (
    <section className="blogx-faq" aria-label="Frequently asked questions">
      <h2>Frequently asked questions</h2>
      <div className="blogx-faq-list">
        {list.map((f, i) => (
          <details className="blogx-faq-item" key={i}>
            <summary className="blogx-faq-q">
              {f.q}
              <span className="blogx-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div className="blogx-faq-a">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

function Fallback({ status }) {
  const map = {
    notfound: {
      ic: '🔍',
      t: 'Post not found',
      b: 'That article may have moved or been unpublished.',
    },
    offline: {
      ic: '🔌',
      t: 'Blog API isn’t running',
      b: 'Posts load from the /api functions — start the app with `vercel dev`.',
    },
    error: {
      ic: '⚠️',
      t: 'Couldn’t load this post',
      b: 'Something went wrong. Please refresh in a moment.',
    },
  };
  const m = map[status] || map.error;
  return (
    <div className="blogx-empty">
      <div className="blogx-empty-ic" aria-hidden="true">{m.ic}</div>
      <h2>{m.t}</h2>
      <p>{m.b}</p>
      <Link to="/blog" className="btn btn-red">
        ← Back to the blog
      </Link>
    </div>
  );
}
