import { useState, useRef, useEffect, useCallback } from 'react';
import { exportKeywordsCsv } from '../../utils/csvExporter';

/**
 * Export dropdown — CSV of the keyword density table.
 */
export default function ExportPanel({ keywords, totalWords }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const hasData = keywords && totalWords > 0;

  const handleCsvKeywords = useCallback(() => {
    exportKeywordsCsv(keywords, totalWords);
    setOpen(false);
  }, [keywords, totalWords]);

  if (!hasData) return null;

  return (
    <div className="ex-wrap" ref={ref}>
      <button className="ex-trigger" onClick={() => setOpen(!open)} aria-label="Export keywords">
        <span className="ex-trigger-icon">&#8615;</span>
        Export CSV
      </button>

      {open && (
        <div className="ex-dropdown">
          <div className="ex-dropdown-head">Export Keywords</div>
          <button className="ex-option" onClick={handleCsvKeywords}>
            <span className="ex-option-icon">CSV</span>
            <div>
              <div className="ex-option-title">Download Keyword Density CSV</div>
              <div className="ex-option-desc">All 1-, 2- and 3-word keywords with count and density.</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
