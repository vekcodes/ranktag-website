import { memo } from 'react';

function severityIcon(sev) {
  if (sev === 'critical') return '!!';
  if (sev === 'warning') return '!';
  if (sev === 'strength') return '\u2713';
  return 'i';
}

function severityClass(sev) {
  if (sev === 'critical') return 'cp-ins-critical';
  if (sev === 'warning') return 'cp-ins-warning';
  if (sev === 'strength') return 'cp-ins-strength';
  return 'cp-ins-suggestion';
}

/**
 * Competitive insights panel — strengths, warnings, and recommendations.
 */
function CompetitorInsights({ insights }) {
  if (!insights || insights.length === 0) return null;

  const strengths = insights.filter((i) => i.severity === 'strength');
  const issues = insights.filter((i) => i.severity !== 'strength');

  return (
    <div className="cp-insights">
      <div className="cp-insights-title">Competitive Insights</div>

      {issues.length > 0 && (
        <div className="cp-ins-section">
          {issues.map((ins, i) => (
            <div key={i} className={`cp-ins-item ${severityClass(ins.severity)}`}>
              <span className={`cp-ins-icon ${severityClass(ins.severity)}-icon`}>
                {severityIcon(ins.severity)}
              </span>
              <div>
                <div className="cp-ins-msg">{ins.message}</div>
                <div className="cp-ins-detail">{ins.detail}</div>
                <span className="cp-ins-cat">{ins.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {strengths.length > 0 && (
        <div className="cp-ins-section cp-ins-strength-section">
          <div className="cp-ins-section-head">Your Competitive Advantages</div>
          {strengths.map((s, i) => (
            <div key={i} className="cp-ins-item cp-ins-strength">
              <span className="cp-ins-icon cp-ins-strength-icon">{'\u2713'}</span>
              <div>
                <div className="cp-ins-msg">{s.message}</div>
                <div className="cp-ins-detail">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(CompetitorInsights);
