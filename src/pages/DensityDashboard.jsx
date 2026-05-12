import { useCallback, useMemo, useState } from 'react';
import Nav from '../components/Nav';
import ProcessingBar from '../components/density/ProcessingBar';
import StatsCards from '../components/density/StatsCards';
import KeywordTable from '../components/density/KeywordTable';
import SettingsPanel from '../components/density/SettingsPanel';
import UrlAnalyzer from '../components/density/UrlAnalyzer';
import VisualizationPanel from '../components/charts/VisualizationPanel';
import ExportPanel from '../components/export/ExportPanel';
import { useDebounce } from '../hooks/useDebounce';
import { analyzeDensity } from '../utils/densityAnalyzer';
import usePageMeta from '../hooks/usePageMeta';
import '../components/charts/charts.css';
import '../components/export/export.css';
import './DensityDashboard.css';

const DEFAULT_OPTIONS = {
  filterStopwords: true,
  removeNumbers: false,
  minFrequency: 2,
  topN: 30,
};

export default function DensityDashboard() {
  usePageMeta({
    title: 'Free Keyword Density Checker · 1-, 2- and 3-Word Analysis · RankedTag',
    description:
      'Free keyword density checker for SEO. Paste content or a URL and get live 1-, 2- and 3-word density with frequency tables, visual charts, and CSV export. Runs in your browser — your text never leaves your device.',
    canonical: 'https://rankedtag.com/keyword-density',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'RankedTag Keyword Density Checker',
      url: 'https://rankedtag.com/keyword-density',
      applicationCategory: 'SEOApplication',
      operatingSystem: 'Any (browser-based)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free, browser-based keyword density checker. Live 1-, 2- and 3-word density, frequency tables, visual charts and CSV export. Text analysis runs locally; URL fetches go through our own server-side scraper.',
      featureList: [
        '1-word, 2-word and 3-word density',
        'Real-time analysis as you type',
        'URL scraping with server-side fetch',
        'Visual charts (bar, donut, stuffing meter, heatmap, cloud)',
        'CSV export',
        'No login, no API key, no tracking',
      ],
    },
  });

  const [content, setContent] = useState('');
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [mode, setMode] = useState('text'); // 'text' | 'url'

  const debouncedContent = useDebounce(content, 250);

  const result = useMemo(() => {
    if (!debouncedContent.trim() || debouncedContent.trim().length < 3) return null;
    return analyzeDensity(debouncedContent, options);
  }, [debouncedContent, options]);

  const handleContentExtracted = useCallback((extractedText) => {
    setContent(extractedText);
    setMode('text');
  }, []);

  const handleClear = useCallback(() => {
    setContent('');
  }, []);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <>
      <Nav variant="tech" />

      <main className="ds-main">
        <ProcessingBar
          sessionId="local"
          loading={false}
          result={result}
          error={null}
        />

        <section className="ds-hero">
          <div className="container">
            <span className="eyebrow">Keyword Density Checker</span>
            <h1 className="h-2" style={{ marginTop: 16, maxWidth: 760 }}>
              Free keyword density checker. Live 1-, 2- and 3-word analysis.
            </h1>
            <p className="lead" style={{ marginTop: 12 }}>
              Paste your content or drop in a URL. Get word frequency, two- and three-word
              phrase density, and a clean breakdown table. Text analysis runs in your browser.
              URL fetches go through our own server-side scraper — no key, no login.
            </p>
          </div>
        </section>

        <section className="ds-body">
          <div className="container-wide">
            <div className="ds-grid">
              <div className="ds-left">
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
                  <UrlAnalyzer onContentExtracted={handleContentExtracted} />
                )}

                <SettingsPanel options={options} onChange={setOptions} />
              </div>

              <div className="ds-right">
                {result && (
                  <div className="ds-right-toolbar">
                    <ExportPanel
                      keywords={result?.keywords}
                      totalWords={result?.statistics?.total_words || 0}
                    />
                  </div>
                )}
                {!result && content.trim().length < 3 ? (
                  <div className="ds-empty-state">
                    <div className="ds-empty-icon">K</div>
                    <div className="ds-empty-title">Ready to Analyze</div>
                    <p className="ds-empty-text">
                      Start typing or paste content on the left. Keyword density tables and
                      charts will appear here instantly as you type.
                    </p>
                  </div>
                ) : (
                  <>
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
