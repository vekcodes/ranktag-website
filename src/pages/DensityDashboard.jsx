import { useState, useEffect, useCallback } from 'react';
import Nav from '../components/Nav';
import ProcessingBar from '../components/density/ProcessingBar';
import StatsCards from '../components/density/StatsCards';
import KeywordTable from '../components/density/KeywordTable';
import SettingsPanel from '../components/density/SettingsPanel';
import UrlAnalyzer from '../components/density/UrlAnalyzer';
import InsightsPanel from '../components/density/InsightsPanel';
import VisualizationPanel from '../components/charts/VisualizationPanel';
import SeoScorePanel from '../components/scoring/SeoScorePanel';
import ExportPanel from '../components/export/ExportPanel';
import { useSession } from '../hooks/useSession';
import { useDebounce } from '../hooks/useDebounce';
import '../components/charts/charts.css';
import '../components/scoring/scoring.css';
import '../components/export/export.css';
import './DensityDashboard.css';

const DEFAULT_OPTIONS = {
  filterStopwords: true,
  removeNumbers: false,
  minFrequency: 2,
  topN: 30,
};

export default function DensityDashboard() {
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [mode, setMode] = useState('text'); // 'text' | 'url'

  const { sessionId, result, error, loading, analyze, reset } = useSession();
  const debouncedContent = useDebounce(content, 500);

  // Fire analysis when debounced content or options change
  useEffect(() => {
    if (debouncedContent.trim().length > 2) {
      analyze(debouncedContent, options);
    }
  }, [debouncedContent, options, analyze]);

  const handleContentExtracted = useCallback((extractedText) => {
    setContent(extractedText);
    setMode('text');
  }, []);

  const handleClear = useCallback(() => {
    setContent('');
    reset();
  }, [reset]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <>
      <Nav variant="tech" />

      <main className="ds-main">
        <ProcessingBar
          sessionId={sessionId}
          loading={loading}
          result={result}
          error={error}
        />

        {/* ── Hero header ── */}
        <section className="ds-hero">
          <div className="container">
            <span className="eyebrow">Keyword Density Checker</span>
            <h1 className="h-2" style={{ marginTop: 16, maxWidth: 700 }}>
              Analyze keyword density like the pros
            </h1>
            <p className="lead" style={{ marginTop: 12 }}>
              Paste your content or enter a URL. Get real-time keyword density analysis with
              professional-grade NLP processing.
            </p>
          </div>
        </section>

        {/* ── Dashboard body ── */}
        <section className="ds-body">
          <div className="container-wide">
            <div className="ds-grid">
              {/* ── Left column: Editor + URL ── */}
              <div className="ds-left">
                {/* Mode tabs */}
                <div className="ds-mode-tabs">
                  <button
                    className={`ds-mode-tab ${mode === 'text' ? 'active' : ''}`}
                    onClick={() => setMode('text')}
                  >
                    Paste Text
                  </button>
                  <button
                    className={`ds-mode-tab ${mode === 'url' ? 'active' : ''}`}
                    onClick={() => setMode('url')}
                  >
                    Analyze URL
                  </button>
                </div>

                {mode === 'text' ? (
                  <div className="ds-editor-wrap">
                    <textarea
                      className="ds-editor"
                      placeholder="Paste your content here to analyze keyword density in real-time..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      spellCheck={false}
                    />
                    <div className="ds-editor-footer">
                      <span className="ds-editor-count mono">
                        {wordCount.toLocaleString()} words
                        {content.length > 0 && <> &middot; {content.length.toLocaleString()} chars</>}
                      </span>
                      {content.length > 0 && (
                        <button className="ds-editor-clear" onClick={handleClear}>Clear</button>
                      )}
                    </div>
                  </div>
                ) : (
                  <UrlAnalyzer
                    onContentExtracted={handleContentExtracted}
                    options={options}
                  />
                )}

                <SettingsPanel options={options} onChange={setOptions} />
              </div>

              {/* ── Right column: Results ── */}
              <div className="ds-right">
                {result && (
                  <div className="ds-right-toolbar">
                    <ExportPanel
                      keywords={result?.keywords}
                      content={content}
                      totalWords={result?.statistics?.total_words || 0}
                    />
                  </div>
                )}
                {!result && !loading && content.trim().length < 3 ? (
                  <div className="ds-empty-state">
                    <div className="ds-empty-icon">K</div>
                    <div className="ds-empty-title">Ready to Analyze</div>
                    <p className="ds-empty-text">
                      Start typing or paste content on the left. Keywords will appear here
                      instantly as you type.
                    </p>
                  </div>
                ) : (
                  <>
                    <SeoScorePanel
                      keywords={result?.keywords}
                      content={content}
                      totalWords={result?.statistics?.total_words || 0}
                    />
                    <StatsCards
                      stats={result?.statistics}
                      processing={result?.processing}
                    />
                    <KeywordTable
                      keywords={result?.keywords}
                      totalWords={result?.statistics?.total_words || 0}
                    />
                    <VisualizationPanel
                      keywords={result?.keywords}
                      content={content}
                      totalWords={result?.statistics?.total_words || 0}
                    />
                    <InsightsPanel
                      keywords={result?.keywords}
                      totalWords={result?.statistics?.total_words || 0}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
