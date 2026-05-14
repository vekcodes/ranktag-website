import { useState } from 'react';

/**
 * URL input form for competitor analysis.
 * Primary URL + dynamic list of competitor URLs (up to 5).
 */
export default function CompetitorInput({ onAnalyze, loading }) {
  const [primaryUrl, setPrimaryUrl] = useState('');
  const [compUrls, setCompUrls] = useState(['']);

  const addUrl = () => { if (compUrls.length < 5) setCompUrls([...compUrls, '']); };
  const removeUrl = (i) => setCompUrls(compUrls.filter((_, idx) => idx !== i));
  const updateUrl = (i, val) => {
    const next = [...compUrls];
    next[i] = val;
    setCompUrls(next);
  };

  const validComps = compUrls.filter((u) => u.trim().length > 3);
  const canSubmit = primaryUrl.trim().length > 3 && validComps.length >= 1 && !loading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) onAnalyze(primaryUrl.trim(), validComps.map((u) => u.trim()));
  };

  return (
    <form className="cp-input" onSubmit={handleSubmit}>
      <div className="cp-input-section">
        <label className="cp-input-label">Your Page URL</label>
        <input
          className="cp-input-field cp-input-primary"
          type="text"
          placeholder="https://yoursite.com/page"
          value={primaryUrl}
          onChange={(e) => setPrimaryUrl(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="cp-input-section">
        <div className="cp-input-label-row">
          <label className="cp-input-label">Competitor URLs</label>
          {compUrls.length < 5 && (
            <button type="button" className="cp-input-add" onClick={addUrl} disabled={loading}>+ Add</button>
          )}
        </div>
        {compUrls.map((url, i) => (
          <div key={i} className="cp-input-comp-row">
            <input
              className="cp-input-field"
              type="text"
              placeholder={`https://competitor${i + 1}.com/page`}
              value={url}
              onChange={(e) => updateUrl(i, e.target.value)}
              disabled={loading}
            />
            {compUrls.length > 1 && (
              <button type="button" className="cp-input-remove" onClick={() => removeUrl(i)} disabled={loading}>&times;</button>
            )}
          </div>
        ))}
      </div>

      <button type="submit" className="cp-input-submit" disabled={!canSubmit}>
        {loading ? (
          <><span className="cp-spinner" /> Analyzing pages...</>
        ) : (
          <>Analyze Competitors</>
        )}
      </button>
    </form>
  );
}
