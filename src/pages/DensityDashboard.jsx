import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Nav from '../components/Nav';
import ProcessingBar from '../components/density/ProcessingBar';
import StatsCards from '../components/density/StatsCards';
import KeywordTable from '../components/density/KeywordTable';
import SettingsPanel from '../components/density/SettingsPanel';
import UrlAnalyzer from '../components/density/UrlAnalyzer';
import VisualizationPanel from '../components/charts/VisualizationPanel';
import ExportPanel from '../components/export/ExportPanel';
import DensityGuide, { DENSITY_FAQ } from '../components/density/DensityGuide';
import { useDebounce } from '../hooks/useDebounce';
import { analyzeDensity } from '../utils/densityAnalyzer';
import { trackToolUse } from '../lib/track';
import usePageMeta from '../hooks/usePageMeta';
import { softwareTool, breadcrumb, faqPage, SITE } from '../lib/schema.js';
import '../components/charts/charts.css';
import '../components/export/export.css';
import './DensityDashboard.css';

const DEFAULT_OPTIONS = {
  filterStopwords: true,
  removeNumbers: false,
  minFrequency: 2,
  topN: 30,
};

const DENSITY_URL = `${SITE}/keyword-density-checker`;
const DENSITY_JSONLD = [
  softwareTool({
    name: 'RankedTag Keyword Density Checker',
    url: DENSITY_URL,
    description:
      'Free, browser-based keyword density checker. Live 1-, 2-, 3- and 4-word density, frequency tables, visual charts and CSV export. Text analysis runs locally; URL fetches go through our own server-side scraper.',
    featureList: [
      '1-, 2-, 3- and 4-word phrase density',
      'Real-time analysis as you type',
      'URL scraping with server-side fetch',
      'Keyword stuffing detection',
      'Visual charts (bar, donut, stuffing meter, heatmap, cloud)',
      'CSV export',
      'No login, no API key, no tracking',
    ],
  }),
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Keyword Density Checker', item: DENSITY_URL },
  ]),
  faqPage(DENSITY_FAQ),
];

export default function DensityDashboard() {
  usePageMeta({
    title: 'Keyword Density Checker — Free Online Tool | RankedTag',
    description:
      'Free keyword density checker. Paste text or a URL to see 1–4 word keyword frequency and %, catch keyword stuffing, and optimize for Google and AI search.',
    canonical: 'https://rankedtag.com/keyword-density-checker',
    jsonLd: DENSITY_JSONLD,
  });

  const [content, setContent] = useState('');
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [mode, setMode] = useState('text'); // 'text' | 'url'

  const debouncedContent = useDebounce(content, 250);

  const result = useMemo(() => {
    if (!debouncedContent.trim() || debouncedContent.trim().length < 3) return null;
    return analyzeDensity(debouncedContent, options);
  }, [debouncedContent, options]);

  // Fire one synthetic pageview the first time a paste-mode analysis renders
  // for this session. Skip URL mode — UrlAnalyzer tracks itself on submit.
  const trackedPaste = useRef(false);
  useEffect(() => {
    if (mode === 'text' && result && !trackedPaste.current) {
      trackedPaste.current = true;
      trackToolUse('keyword-density-paste', {
        words: result?.statistics?.total_words || 0,
      });
    }
  }, [mode, result]);

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
              Keyword Density Checker — free, unlimited, no sign-up.
            </h1>
            <p className="lead" style={{ marginTop: 12 }}>
              Paste your text or drop in a URL and instantly see how often every keyword and phrase
              appears — as a count and a percentage, grouped into 1-, 2-, 3- and 4-word phrases.
              Catch keyword stuffing, benchmark competitors, and optimize for Google and AI search.
              Text analysis runs in your browser; URL fetches use our own server-side scraper.
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

        <DensityGuide />
      </main>
    </>
  );
}
