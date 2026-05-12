import { useState } from 'react';
import { api } from '../../lib/api';

/**
 * URL analysis panel — fetches a webpage server-side and hands the extracted
 * text up to the dashboard. Uses the Vercel /api/density-url endpoint
 * (browsers cannot scrape cross-origin pages, so the fetch has to happen
 * on the server).
 */
export default function UrlAnalyzer({ onContentExtracted }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setMeta(null);

    try {
      const res = await api.densityUrl(url.trim());
      setMeta({
        title: res.title,
        metaDescription: res.meta_description,
        canonical: res.canonical,
        language: res.language,
        h1Tags: res.h1_tags,
        h2Tags: res.h2_tags,
        wordCount: res.content_word_count,
        statusCode: res.status_code,
        finalUrl: res.final_url,
      });
      if (res.content && onContentExtracted) {
        onContentExtracted(res.content);
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ds-url-panel">
      <form className="ds-url-form" onSubmit={handleSubmit}>
        <input
          className="ds-url-input"
          type="text"
          placeholder="Enter URL to analyze (e.g. example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button className="ds-url-btn" type="submit" disabled={loading || !url.trim()}>
          {loading ? (
            <span className="ds-url-spinner" />
          ) : (
            'Analyze URL'
          )}
        </button>
      </form>

      {error && (
        <div className="ds-url-error">
          <strong>Error:</strong> {error}
          <button className="ds-url-retry" onClick={() => handleSubmit()}>Retry</button>
        </div>
      )}

      {meta && (
        <div className="ds-url-meta">
          <div className="ds-url-meta-row">
            <span className="ds-url-meta-label">Title</span>
            <span className="ds-url-meta-val">{meta.title || '—'}</span>
          </div>
          <div className="ds-url-meta-row">
            <span className="ds-url-meta-label">Description</span>
            <span className="ds-url-meta-val ds-url-meta-desc">{meta.metaDescription || '—'}</span>
          </div>
          <div className="ds-url-meta-grid">
            <div className="ds-url-meta-chip">
              <span className="ds-url-meta-chip-lbl">Status</span>
              <span className={`ds-url-meta-chip-val ${meta.statusCode === 200 ? 'ok' : 'err'}`}>
                {meta.statusCode}
              </span>
            </div>
            <div className="ds-url-meta-chip">
              <span className="ds-url-meta-chip-lbl">Language</span>
              <span className="ds-url-meta-chip-val">{meta.language || '—'}</span>
            </div>
            <div className="ds-url-meta-chip">
              <span className="ds-url-meta-chip-lbl">Words</span>
              <span className="ds-url-meta-chip-val">{meta.wordCount?.toLocaleString()}</span>
            </div>
            <div className="ds-url-meta-chip">
              <span className="ds-url-meta-chip-lbl">H1 Tags</span>
              <span className="ds-url-meta-chip-val">{meta.h1Tags?.length || 0}</span>
            </div>
          </div>
          {meta.h1Tags?.length > 0 && (
            <div className="ds-url-meta-tags">
              <span className="ds-url-meta-label">H1</span>
              {meta.h1Tags.map((h, i) => <span key={i} className="ds-url-tag">{h}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
