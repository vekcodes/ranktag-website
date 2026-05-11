import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { exportKeywordsCsv, exportFullReportCsv } from '../../utils/csvExporter';
import { computeSeoScore } from '../../utils/seoScorer';

const API_BASE = (import.meta.env.VITE_DENSITY_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

/**
 * Export dropdown panel — CSV (client-side) + PDF (backend).
 */
export default function ExportPanel({ keywords, content, totalWords }) {
  const [open, setOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const ref = useRef(null);

  const score = useMemo(
    () => computeSeoScore(keywords, content, totalWords),
    [keywords, content, totalWords],
  );

  // Close dropdown on outside click
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

  const handleCsvFull = useCallback(() => {
    exportFullReportCsv(keywords, totalWords, score);
    setOpen(false);
  }, [keywords, totalWords, score]);

  const handlePdf = useCallback(async () => {
    if (!score) return;
    setPdfLoading(true);
    setPdfError(null);

    // Build the payload matching ExportRequest
    const payload = {
      text: content,
      total_words: totalWords,
      overall_score: score.overall,
      grade: score.grade,
      category_scores: score.categories.map((c) => ({
        name: c.name, score: c.score, weight: c.weight, weighted: c.weighted, details: c.details,
      })),
      readability: score.readability ? {
        flesch_reading_ease: score.readability.fre,
        flesch_kincaid_grade: score.readability.grade,
        reading_level: score.readability.level,
        avg_sentence_length: score.readability.avgSL,
        avg_syllables_per_word: 0,
        long_sentence_count: 0,
        long_sentence_pct: score.readability.longPct,
        passive_voice_count: 0,
        passive_voice_pct: score.readability.passivePct,
        difficult_word_pct: 0,
        readability_score: score.readability.score,
      } : null,
      keywords: keywords,
      recommendations: score.recommendations.map((r) => ({
        category: r.category, severity: r.severity, message: r.message, detail: r.detail,
      })),
      warnings: score.warnings.map((w) => ({
        category: w.category, severity: w.severity, message: w.message, detail: w.detail,
      })),
      strengths: score.strengths.map((s) => ({ category: s.category, message: s.message })),
      include_charts: true,
      include_recommendations: true,
      include_raw_keywords: true,
    };

    try {
      const res = await fetch(`${API_BASE}/export/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'seo-audit-report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (err) {
      setPdfError(err.message || 'PDF generation failed');
    } finally {
      setPdfLoading(false);
    }
  }, [content, totalWords, keywords, score]);

  if (!hasData) return null;

  return (
    <div className="ex-wrap" ref={ref}>
      <button className="ex-trigger" onClick={() => setOpen(!open)} aria-label="Export report">
        <span className="ex-trigger-icon">&#8615;</span>
        Export
      </button>

      {open && (
        <div className="ex-dropdown">
          <div className="ex-dropdown-head">Export Report</div>

          <button className="ex-option" onClick={handleCsvKeywords}>
            <span className="ex-option-icon">CSV</span>
            <div>
              <div className="ex-option-title">Keywords Only</div>
              <div className="ex-option-desc">All keyword data as CSV</div>
            </div>
          </button>

          <button className="ex-option" onClick={handleCsvFull}>
            <span className="ex-option-icon">CSV</span>
            <div>
              <div className="ex-option-title">Full SEO Report</div>
              <div className="ex-option-desc">Scores, readability, recommendations + keywords</div>
            </div>
          </button>

          <div className="ex-divider" />

          <button className="ex-option" onClick={handlePdf} disabled={pdfLoading}>
            <span className="ex-option-icon ex-option-icon-pdf">PDF</span>
            <div>
              <div className="ex-option-title">
                {pdfLoading ? 'Generating...' : 'PDF Audit Report'}
              </div>
              <div className="ex-option-desc">Professional branded PDF report</div>
            </div>
            {pdfLoading && <span className="ex-spinner" />}
          </button>

          {pdfError && (
            <div className="ex-error">
              {pdfError}
              <button className="ex-error-retry" onClick={handlePdf}>Retry</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
