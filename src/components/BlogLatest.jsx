import { useEffect, useState } from 'react';
import { blogApi } from '../lib/blogApi.js';
import './blogLatest.css';

// Latest posts on the home page. Renders nothing until there are published
// posts, so the section never shows empty before the blog launches.
export default function BlogLatest() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let alive = true;
    blogApi
      .list(3)
      .then((r) => { if (alive) setPosts(r.posts || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!posts.length) return null;

  return (
    <section className="blog-latest" data-reveal id="blog">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">From the blog · SEO &amp; inbound playbooks</div>
          <h2 className="h-1">What we&apos;re writing about.</h2>
        </div>

        <div className="bl-grid">
          {posts.map((p) => (
            <a className="bl-card" key={p.slug} href={`/blog/${p.slug}`}>
              {p.cover_image_url ? (
                <img
                  className="bl-img"
                  src={p.cover_image_url}
                  alt={p.cover_image_alt || p.title}
                  loading="lazy"
                  decoding="async"
                  width="640"
                  height="360"
                />
              ) : (
                <div className="bl-img bl-img-ph" />
              )}
              <div className="bl-body">
                <h3>{p.title}</h3>
                <p>{p.excerpt}</p>
                <span className="bl-meta">
                  {new Date(p.published_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}{' '}
                  · {p.reading_minutes} min read
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="bl-all">
          <a href="/blog" className="btn btn-outline btn-lg">
            Read the blog <span className="ar">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
