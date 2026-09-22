import { useEffect, useState, useCallback } from 'react';
import { blogApi, ApiUnreachableError } from '../../lib/blogApi.js';
import { compressImage } from '../../lib/imageCompress.js';
import Editor from './Editor.jsx';
import './admin.css';

const EMPTY = {
  title: '', slug: '', status: 'draft', excerpt: '', meta_title: '',
  meta_description: '', tags: '', cover_image_url: '', cover_image_alt: '',
  og_image_url: '', canonical_url: '', custom_jsonld: '', content_html: '',
  faqs: [],
};

function slugify(s) {
  return s.toLowerCase().trim().replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

const LOGO = (
  <img className="brand-mark" src="/rankedtag-mark.svg" alt="RankedTag" width="30" height="30" />
);

// Shown when /api/* isn't reachable (running `npm run dev` instead of `vercel dev`).
function SetupNeeded({ onRetry }) {
  return (
    <div className="admin-login">
      <div className="setup-card">
        <div className="brand">{LOGO}<span>RankedTag CMS</span></div>
        <h1>API not reachable</h1>
        <p>
          The admin & blog APIs run as Vercel functions. Start the app with{' '}
          <code>vercel dev</code> — plain <code>npm run dev</code> serves the
          frontend only, so login and uploads can't work.
        </p>
        <ol className="setup-steps">
          <li><code>npm i -g vercel</code> &nbsp;then&nbsp; <code>vercel link</code></li>
          <li><code>vercel env pull .env.local</code></li>
          <li><code>node scripts/migrate-blog.mjs</code> (creates tables)</li>
          <li><code>vercel dev</code> &nbsp;→ open&nbsp; <code>/admin</code></li>
        </ol>
        <button className="btn primary" onClick={onRetry}>Retry connection</button>
      </div>
    </div>
  );
}

// ── Login ──
function Login({ onIn, onUnreachable }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await blogApi.login(pw);
      onIn();
    } catch (e2) {
      if (e2 instanceof ApiUnreachableError) return onUnreachable();
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="admin-login">
      <form onSubmit={submit}>
        <div className="brand">{LOGO}<span>RankedTag CMS</span></div>
        <p className="sub">Sign in to manage the blog</p>
        <input
          type="password"
          placeholder="Admin password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
        />
        {err && <div className="err">{err}</div>}
        <button disabled={busy || !pw}>{busy ? 'Checking…' : 'Sign in →'}</button>
        <p className="hint">Password is the <code>BLOG_ADMIN_PASSWORD</code> env var.</p>
      </form>
    </div>
  );
}

// ── Post list ──
function PostList({ onNew, onEdit, onLogout }) {
  const [posts, setPosts] = useState(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => {
    blogApi.adminList().then((r) => setPosts(r.posts)).catch((e) => setErr(e.message));
  }, []);
  useEffect(load, [load]);
  const del = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return;
    await blogApi.remove(id);
    load();
  };
  return (
    <div className="admin-wrap">
      <header className="admin-top">
        <h1>Posts</h1>
        <div>
          <button className="btn" onClick={onNew}>+ New post</button>
          <button className="btn ghost" onClick={onLogout}>Log out</button>
        </div>
      </header>
      {err && <div className="err">{err}</div>}
      {!posts ? (
        <p className="muted">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="muted">No posts yet. Create your first one.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Status</th><th>Updated</th><th></th></tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.title}</strong>
                  <div className="muted sm">/blog/{p.slug}</div>
                </td>
                <td>
                  <span className={`pill ${p.status}`}>{p.status}</span>
                </td>
                <td className="muted sm">
                  {new Date(p.updated_at).toLocaleDateString()}
                </td>
                <td className="row-actions">
                  <button className="btn sm" onClick={() => onEdit(p.id)}>Edit</button>
                  {p.status === 'published' && (
                    <a className="btn sm ghost" href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">View</a>
                  )}
                  <button className="btn sm danger" onClick={() => del(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Editor form ──
function PostForm({ id, onDone }) {
  const [f, setF] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(!id);

  useEffect(() => {
    if (!id) return;
    blogApi.get(id).then((r) => {
      const p = r.post;
      setF({
        title: p.title || '', slug: p.slug || '', status: p.status || 'draft',
        excerpt: p.excerpt || '', meta_title: p.meta_title || '',
        meta_description: p.meta_description || '',
        tags: (p.tags || []).join(', '),
        cover_image_url: p.cover_image_url || '',
        cover_image_alt: p.cover_image_alt || '',
        og_image_url: p.og_image_url || '',
        canonical_url: p.canonical_url || '',
        custom_jsonld: p.custom_jsonld || '',
        content_html: p.content_html || '',
        faqs: Array.isArray(p.faqs)
          ? p.faqs.map((x) => ({ q: x?.q || '', a: x?.a || '' }))
          : [],
      });
      setLoaded(true);
    }).catch((e) => setErr(e.message));
  }, [id]);

  const set = (k) => (e) => {
    const v = e?.target ? e.target.value : e;
    setF((s) => ({
      ...s,
      [k]: v,
      ...(k === 'title' && !slugTouched ? { slug: slugify(v) } : {}),
    }));
  };

  // FAQ accordion editor — add/edit/remove an arbitrary number of Q&A pairs.
  const addFaq = () =>
    setF((s) => ({ ...s, faqs: [...s.faqs, { q: '', a: '' }] }));
  const updateFaq = (i, key) => (e) => {
    const v = e.target.value;
    setF((s) => ({
      ...s,
      faqs: s.faqs.map((row, idx) => (idx === i ? { ...row, [key]: v } : row)),
    }));
  };
  const removeFaq = (i) =>
    setF((s) => ({ ...s, faqs: s.faqs.filter((_, idx) => idx !== i) }));
  const moveFaq = (i, dir) =>
    setF((s) => {
      const j = i + dir;
      if (j < 0 || j >= s.faqs.length) return s;
      const faqs = [...s.faqs];
      [faqs[i], faqs[j]] = [faqs[j], faqs[i]];
      return { ...s, faqs };
    });

  const uploadCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const alt = window.prompt('Cover image alt text (required for SEO):', f.title);
    if (!alt || alt.trim().length < 3) { alert('Alt text required (min 3 chars).'); return; }
    try {
      setBusy(true);
      const c = await compressImage(file, { maxDim: 1600, targetBytes: 240_000 });
      const r = await blogApi.upload({
        filename: file.name, alt: alt.trim(), dataBase64: c.dataUrl,
        type: c.type, width: c.width, height: c.height,
      });
      setF((s) => ({ ...s, cover_image_url: r.url, cover_image_alt: r.alt }));
    } catch (e2) {
      alert(`Upload failed: ${e2.message}`);
    } finally {
      setBusy(false);
    }
  };

  const save = async (publish) => {
    setBusy(true);
    setErr('');
    const payload = {
      ...f,
      source_format: 'html',
      status: publish ? 'published' : f.status,
      tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean),
      faqs: f.faqs
        .map((x) => ({ q: x.q.trim(), a: x.a.trim() }))
        .filter((x) => x.q && x.a),
    };
    try {
      if (id) await blogApi.update(id, payload);
      else await blogApi.create(payload);
      onDone();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  if (!loaded) return <div className="admin-wrap"><p className="muted">Loading…</p></div>;

  const metaLen = (f.meta_description || f.excerpt).length;

  // Live JSON validity for the optional custom JSON-LD block. Empty is fine;
  // invalid JSON blocks saving so the server never rejects on submit.
  const customLd = (f.custom_jsonld || '').trim();
  const customLdError = (() => {
    if (!customLd) return '';
    try {
      const v = JSON.parse(customLd);
      const nodes = Array.isArray(v) ? v : [v];
      if (!nodes.every((n) => n && typeof n === 'object' && !Array.isArray(n)))
        return 'Must be a JSON object or an array of objects.';
      return '';
    } catch {
      return 'Not valid JSON.';
    }
  })();

  return (
    <div className="admin-wrap editor-layout">
      <div className="editor-main">
        <button className="btn ghost sm" onClick={onDone}>← Back</button>
        <input
          className="title-input"
          placeholder="Post title"
          value={f.title}
          onChange={set('title')}
        />
        <Editor
          value={f.content_html}
          onChange={(html) => setF((s) => ({ ...s, content_html: html }))}
        />
      </div>

      <aside className="editor-side">
        <div className="card">
          <h3>Publish</h3>
          {err && <div className="err">{err}</div>}
          <div className="muted sm">Status: <strong>{f.status}</strong></div>
          <div className="btn-col">
            <button className="btn" disabled={busy || Boolean(customLdError)} onClick={() => save(false)}>
              {busy ? 'Saving…' : 'Save draft'}
            </button>
            <button className="btn primary" disabled={busy || Boolean(customLdError)} onClick={() => save(true)}>
              {f.status === 'published' ? 'Update (live)' : 'Publish'}
            </button>
          </div>
          {customLdError && (
            <div className="muted sm warn">Fix the custom JSON-LD before saving.</div>
          )}
        </div>

        <div className="card">
          <h3>SEO</h3>
          <label>URL slug
            <input value={f.slug}
              onChange={(e) => { setSlugTouched(true); set('slug')(e); }} />
          </label>
          <div className="muted sm">rankedtag.com/blog/{f.slug || '…'}</div>

          <label>Meta title
            <input value={f.meta_title} onChange={set('meta_title')}
              placeholder="Defaults to post title" />
          </label>

          <label>Meta description
            <textarea rows={3} value={f.meta_description}
              onChange={set('meta_description')}
              placeholder="Defaults to excerpt / first paragraph" />
          </label>
          <div className={`muted sm ${metaLen > 160 ? 'warn' : ''}`}>
            {metaLen}/160 chars
          </div>

          <label>Excerpt (card + summary)
            <textarea rows={2} value={f.excerpt} onChange={set('excerpt')} />
          </label>

          <label>Tags (comma separated)
            <input value={f.tags} onChange={set('tags')}
              placeholder="seo, geo, saas" />
          </label>

          <label>Canonical URL (optional)
            <input value={f.canonical_url} onChange={set('canonical_url')}
              placeholder="Leave blank for default" />
          </label>

          <label>Custom JSON-LD schema (advanced)
            <textarea
              rows={6}
              value={f.custom_jsonld}
              onChange={set('custom_jsonld')}
              spellCheck={false}
              className={`code ${customLdError ? 'invalid' : ''}`}
              placeholder={'Optional. A JSON object or array of schema.org\nobjects, e.g. an FAQPage or HowTo. Added on top\nof the automatic BlogPosting + Breadcrumb schema.'}
            />
          </label>
          {customLdError ? (
            <div className="muted sm warn">⚠ {customLdError}</div>
          ) : customLd ? (
            <div className="muted sm">✓ Valid JSON-LD — merged with the auto schema.</div>
          ) : (
            <div className="muted sm">
              Auto schema (BlogPosting + Breadcrumb) is always added. Paste extra
              schema.org JSON here to layer on FAQPage, HowTo, etc.
            </div>
          )}
        </div>

        <div className="card">
          <h3>Cover image</h3>
          {f.cover_image_url && (
            <img className="cover-preview" src={f.cover_image_url} alt={f.cover_image_alt} />
          )}
          <label className="btn ghost sm filebtn">
            {busy ? 'Uploading…' : 'Upload cover (auto-WebP)'}
            <input type="file" accept="image/*" hidden onChange={uploadCover} />
          </label>
          <label>Cover alt text
            <input value={f.cover_image_alt} onChange={set('cover_image_alt')} />
          </label>
          <label>OG image URL (social share)
            <input value={f.og_image_url} onChange={set('og_image_url')}
              placeholder="Defaults to cover image" />
          </label>
        </div>

        <div className="card">
          <h3>FAQs</h3>
          <p className="muted sm" style={{ marginTop: 0 }}>
            Shown as a dropdown accordion at the bottom of the post and added as
            FAQPage schema for rich results. Add as many as you like.
          </p>
          {f.faqs.length === 0 && (
            <p className="muted sm">No FAQs yet.</p>
          )}
          <div className="faq-editor">
            {f.faqs.map((row, i) => (
              <div className="faq-row" key={i}>
                <div className="faq-row-top">
                  <span className="faq-row-n">Q{i + 1}</span>
                  <div className="faq-row-actions">
                    <button type="button" className="btn ghost sm"
                      disabled={i === 0} onClick={() => moveFaq(i, -1)}
                      title="Move up">↑</button>
                    <button type="button" className="btn ghost sm"
                      disabled={i === f.faqs.length - 1} onClick={() => moveFaq(i, 1)}
                      title="Move down">↓</button>
                    <button type="button" className="btn danger sm"
                      onClick={() => removeFaq(i)} title="Remove">✕</button>
                  </div>
                </div>
                <input
                  value={row.q}
                  onChange={updateFaq(i, 'q')}
                  placeholder="Question"
                />
                <textarea
                  rows={3}
                  value={row.a}
                  onChange={updateFaq(i, 'a')}
                  placeholder="Answer (plain text)"
                />
              </div>
            ))}
          </div>
          <button type="button" className="btn ghost sm faq-add" onClick={addFaq}>
            + Add FAQ
          </button>
        </div>
      </aside>
    </div>
  );
}

export default function AdminApp() {
  const [state, setState] = useState({ view: 'loading', id: null });

  const probe = useCallback(() => {
    setState({ view: 'loading', id: null });
    blogApi.session()
      .then(() => setState({ view: 'list', id: null }))
      .catch((e) =>
        setState({
          view: e instanceof ApiUnreachableError ? 'setup' : 'login',
          id: null,
        })
      );
  }, []);

  useEffect(probe, [probe]);

  const logout = async () => {
    try { await blogApi.logout(); } catch { /* ignore */ }
    setState({ view: 'login', id: null });
  };

  if (state.view === 'loading')
    return (
      <div className="admin-login">
        <div className="brand big">{LOGO}<span>RankedTag CMS</span></div>
      </div>
    );
  if (state.view === 'setup') return <SetupNeeded onRetry={probe} />;
  if (state.view === 'login')
    return (
      <Login
        onIn={() => setState({ view: 'list', id: null })}
        onUnreachable={() => setState({ view: 'setup', id: null })}
      />
    );
  if (state.view === 'edit' || state.view === 'new')
    return (
      <PostForm
        id={state.id}
        onDone={() => setState({ view: 'list', id: null })}
      />
    );
  return (
    <PostList
      onNew={() => setState({ view: 'new', id: null })}
      onEdit={(id) => setState({ view: 'edit', id })}
      onLogout={logout}
    />
  );
}
