/**
 * Analysis settings panel with toggles and sliders.
 */
export default function SettingsPanel({ options, onChange }) {
  const update = (key, value) => onChange({ ...options, [key]: value });

  return (
    <div className="ds-settings">
      <div className="ds-settings-title">Analysis Settings</div>

      <label className="ds-toggle-row">
        <span>Remove Stopwords</span>
        <input
          type="checkbox"
          className="ds-toggle"
          checked={options.filterStopwords}
          onChange={(e) => update('filterStopwords', e.target.checked)}
        />
      </label>

      <label className="ds-toggle-row">
        <span>Remove Numbers</span>
        <input
          type="checkbox"
          className="ds-toggle"
          checked={options.removeNumbers}
          onChange={(e) => update('removeNumbers', e.target.checked)}
        />
      </label>

      <div className="ds-slider-row">
        <div className="ds-slider-label">
          <span>Min Frequency</span>
          <span className="ds-slider-val">{options.minFrequency}</span>
        </div>
        <input
          type="range"
          className="slider"
          min={1}
          max={10}
          value={options.minFrequency}
          onChange={(e) => update('minFrequency', parseInt(e.target.value, 10))}
        />
      </div>

      <div className="ds-slider-row">
        <div className="ds-slider-label">
          <span>Top Keywords</span>
          <span className="ds-slider-val">{options.topN}</span>
        </div>
        <input
          type="range"
          className="slider"
          min={5}
          max={100}
          step={5}
          value={options.topN}
          onChange={(e) => update('topN', parseInt(e.target.value, 10))}
        />
      </div>
    </div>
  );
}
