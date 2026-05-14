import { useState, useCallback } from 'react';
import Nav from '../components/Nav';
import CompetitorInput from '../components/competitor/CompetitorInput';
import ComparisonTable from '../components/competitor/ComparisonTable';
import KeywordGapTable from '../components/competitor/KeywordGapTable';
import CompetitorRadar from '../components/competitor/CompetitorRadar';
import CompetitorInsights from '../components/competitor/CompetitorInsights';
import { competitorAnalyze } from '../lib/densityApi';
import { trackToolUse } from '../lib/track';
import { submitToolUsage, syntheticEmail } from '../lib/hubspot.js';
import './CompetitorAnalysis.css';

export default function CompetitorAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = useCallback(async (primaryUrl, competitorUrls) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const competitorList = competitorUrls.map((u) => `  • ${u}`).join('\n');
      const message = [
        'Source: Competitor Analysis',
        `Your site: ${primaryUrl}`,
        'Competitors checked:',
        competitorList,
      ].join('\n');
      submitToolUsage(import.meta.env.VITE_HUBSPOT_COMPETITOR_FORM_ID, {
        email: syntheticEmail(primaryUrl),
        website: primaryUrl,
        message,
      }).catch(() => {});
      const res = await competitorAnalyze(primaryUrl, competitorUrls);
      setResult(res);
      trackToolUse('competitor-analyze', {
        url: primaryUrl,
        competitors: competitorUrls.length,
      });
    } catch (e) {
      setError(e.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const validComps = result?.competitors?.filter((c) => !c.error) || [];

  return (
    <>
      <Nav variant="tech" />
      <main className="cp-main">
        {/* ── Hero ── */}
        <section className="cp-hero">
          <div className="container">
            <span className="eyebrow">Competitor Analysis</span>
            <h1 className="h-2" style={{ marginTop: 16, maxWidth: 700 }}>
              Compare your content against the competition
            </h1>
            <p className="lead" style={{ marginTop: 12 }}>
              Enter your page and up to 5 competitor URLs. Get keyword gaps,
              SEO score comparison, and actionable optimization insights.
            </p>
          </div>
        </section>

        {/* ── Input ── */}
        <section className="cp-body">
          <div className="container-wide">
            <CompetitorInput onAnalyze={handleAnalyze} loading={loading} />

            {error && (
              <div className="cp-error">
                <strong>Error:</strong> {error}
              </div>
            )}

            {loading && (
              <div className="cp-loading">
                <span className="cp-spinner-lg" />
                <div className="cp-loading-text">
                  Crawling and analyzing pages...
                  <span className="cp-loading-sub">This may take 10-30 seconds depending on page sizes.</span>
                </div>
              </div>
            )}

            {/* ── Results ── */}
            {result && !loading && (
              <div className="cp-results">
                {/* Summary cards */}
                <div className="cp-summary-row">
                  <div className="cp-summary-card cp-summary-primary">
                    <div className="cp-summary-label">Your Score</div>
                    <div className="cp-summary-score" style={{ color: result.primary.overall_score >= 60 ? 'var(--success)' : 'var(--red)' }}>
                      {result.primary.overall_score}
                    </div>
                    <div className="cp-summary-grade">{result.primary.grade}</div>
                    <div className="cp-summary-words">{result.primary.word_count?.toLocaleString()} words</div>
                  </div>
                  <div className="cp-summary-card">
                    <div className="cp-summary-label">Competitor Avg</div>
                    <div className="cp-summary-score" style={{ color: 'var(--periwinkle-deep)' }}>
                      {result.benchmarks.avg_overall_score}
                    </div>
                    <div className="cp-summary-grade">Benchmark</div>
                    <div className="cp-summary-words">{Math.round(result.benchmarks.avg_word_count).toLocaleString()} words avg</div>
                  </div>
                  <div className="cp-summary-card">
                    <div className="cp-summary-label">Keyword Gaps</div>
                    <div className="cp-summary-score" style={{ color: result.keyword_gaps.length > 5 ? 'var(--red)' : 'var(--warn)' }}>
                      {result.keyword_gaps.length}
                    </div>
                    <div className="cp-summary-grade">Missing</div>
                    <div className="cp-summary-words">{result.unique_advantages.length} unique to you</div>
                  </div>
                  <div className="cp-summary-card">
                    <div className="cp-summary-label">Pages Analyzed</div>
                    <div className="cp-summary-score" style={{ color: 'var(--ink)' }}>
                      {1 + validComps.length}
                    </div>
                    <div className="cp-summary-grade">{validComps.length} competitor{validComps.length !== 1 ? 's' : ''}</div>
                    {result.competitors.filter((c) => c.error).length > 0 && (
                      <div className="cp-summary-words" style={{ color: 'var(--red)' }}>
                        {result.competitors.filter((c) => c.error).length} failed
                      </div>
                    )}
                  </div>
                </div>

                {/* Radar + Insights side by side */}
                <div className="cp-row-2col">
                  <CompetitorRadar primary={result.primary} competitors={validComps} />
                  <CompetitorInsights insights={result.insights} />
                </div>

                {/* Comparison table */}
                <ComparisonTable
                  primary={result.primary}
                  competitors={validComps}
                  benchmarks={result.benchmarks}
                />

                {/* Keyword gap table */}
                <KeywordGapTable
                  gaps={result.keyword_gaps}
                  shared={result.shared_keywords}
                  unique={result.unique_advantages}
                  competitorCount={validComps.length}
                />

                {/* Failed competitors */}
                {result.competitors.filter((c) => c.error).length > 0 && (
                  <div className="cp-failed">
                    <div className="cp-failed-title">Failed URLs</div>
                    {result.competitors.filter((c) => c.error).map((c, i) => (
                      <div key={i} className="cp-failed-item">
                        <code>{c.url}</code>
                        <span>{c.error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
