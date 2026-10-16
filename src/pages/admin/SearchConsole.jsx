// Search Console dashboard for /admin.
//
// Chart decisions worth keeping (they are easy to "fix" into being wrong):
//   - Clicks and impressions get their OWN charts. They differ by ~2 orders of
//     magnitude, and putting them on one plot needs two y-scales, which makes
//     the crossing point an artefact of the axis choice rather than a fact.
//   - One series per chart, so there is no categorical palette to get wrong and
//     no legend to need: the panel title names the measure.
//   - Periwinkle is this system's data colour (brand.css: "data, eyebrows,
//     links, focus"), and it clears contrast on the card surface.
//   - Rankings (queries, pages) are tables, not bar charts. You read them by
//     name and compare four numbers per row, which a table does better.
import { useCallback, useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { blogApi } from '../../lib/blogApi.js';

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 28, label: '28 days' },
  { days: 90, label: '3 months' },
  { days: 180, label: '6 months' },
  { days: 480, label: '16 months' },
];

const DATA = '#98A8F8';   // --peri
const GOOD = '#5BC08A';   // --success
const BAD = '#F8A08A';    // a lighter red than --red, legible as small text

const nf = new Intl.NumberFormat('en-GB');

function pct(n) {
  return `${(n * 100).toFixed(2)}%`;
}

function shortDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/**
 * Position is the one metric where down is good, so the arrow and the colour
 * are inverted for it. Both carry a sign and a word, never colour alone.
 */
function Delta({ now, before, invert = false }) {
  if (!before) return null;
  const change = ((now - before) / before) * 100;
  if (!Number.isFinite(change)) return null;
  const better = invert ? change < 0 : change > 0;
  const flat = Math.abs(change) < 0.05;
  return (
    <span
      className="gsc-delta"
      style={{ color: flat ? 'var(--muted)' : better ? GOOD : BAD }}
    >
      {flat ? '0%' : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
      <span className="gsc-delta-note">
        {flat ? ' no change' : better ? ' better' : ' worse'}
      </span>
    </span>
  );
}

function Stat({ label, value, now, before, invert }) {
  return (
    <div className="gsc-stat">
      <div className="gsc-stat-label">{label}</div>
      <div className="gsc-stat-value">{value}</div>
      <Delta now={now} before={before} invert={invert} />
    </div>
  );
}

function ChartTip({ active, payload, label, format }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="gsc-tip">
      <div className="gsc-tip-date">{shortDate(label)}</div>
      <div className="gsc-tip-value">{format(payload[0].value)}</div>
    </div>
  );
}

function TrendChart({ title, rows, dataKey, format }) {
  if (!rows.length) {
    return (
      <div className="card gsc-chart">
        <h3>{title}</h3>
        <p className="muted sm">No data in this window.</p>
      </div>
    );
  }
  return (
    <div className="card gsc-chart">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="rgba(244,239,231,.08)" vertical={false} />
          <XAxis
            dataKey="key"
            tickFormatter={shortDate}
            tick={{ fill: 'var(--muted-2)', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(244,239,231,.12)' }}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: 'var(--muted-2)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={format}
          />
          <Tooltip
            content={<ChartTip format={format} />}
            cursor={{ stroke: 'rgba(244,239,231,.25)', strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={DATA}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: DATA, stroke: 'var(--ink-2)', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RankTable({ title, rows, linkify }) {
  if (!rows.length) {
    return (
      <div className="card gsc-table-card">
        <h3>{title}</h3>
        <p className="muted sm">No data in this window.</p>
      </div>
    );
  }
  return (
    <div className="card gsc-table-card">
      <h3>{title}</h3>
      <table className="admin-table gsc-table">
        <thead>
          <tr>
            <th></th>
            <th className="num">Clicks</th>
            <th className="num">Impr.</th>
            <th className="num">CTR</th>
            <th className="num">Pos.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td className="gsc-key" title={r.key}>
                {linkify ? (
                  <a href={r.key} target="_blank" rel="noreferrer">
                    {r.key.replace(/^https?:\/\/[^/]+/, '') || '/'}
                  </a>
                ) : (
                  r.key
                )}
              </td>
              <td className="num">{nf.format(r.clicks)}</td>
              <td className="num">{nf.format(r.impressions)}</td>
              <td className="num">{pct(r.ctr)}</td>
              <td className="num">{r.position.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Shown instead of the dashboard when the service account is not wired up yet,
// so the fix is on screen rather than in a doc somewhere.
function NotConfigured({ detail }) {
  return (
    <div className="card gsc-setup">
      <h3>Search Console is not connected yet</h3>
      {detail && <p className="err">{detail}</p>}
      <ol className="setup-steps">
        <li>
          Google Cloud Console: enable the <strong>Google Search Console API</strong>,
          create a service account, download its JSON key.
        </li>
        <li>
          Search Console: <em>Settings, Users and permissions, Add user</em>. Paste
          the key's <code>client_email</code>, permission <strong>Full</strong>.
        </li>
        <li>
          Base64 the key file:{' '}
          <code>base64 -i key.json | tr -d '\n' | pbcopy</code>
        </li>
        <li>
          Vercel: <em>Settings, Environment Variables</em>, add{' '}
          <code>GSC_SERVICE_ACCOUNT_JSON</code> (paste) and{' '}
          <code>GSC_SITE_URL</code> (e.g. <code>sc-domain:rankedtag.com</code>),
          then redeploy.
        </li>
      </ol>
      <p className="muted sm">
        Check it locally first with{' '}
        <code>node scripts/gsc.mjs sites --key ./key.json</code>, which lists the
        properties the service account can actually read.
      </p>
    </div>
  );
}

export default function SearchConsole({ onBack }) {
  const [days, setDays] = useState(28);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [unconfigured, setUnconfigured] = useState(false);
  const [busy, setBusy] = useState(true);

  const load = useCallback(() => {
    setBusy(true);
    setErr('');
    blogApi
      .gscOverview({ days, limit: 25 })
      .then((d) => {
        setData(d);
        setUnconfigured(false);
      })
      .catch((e) => {
        // 503 is specifically "no credentials", which has its own screen.
        if (e.status === 503) setUnconfigured(true);
        setErr(e.message);
        setData(null);
      })
      .finally(() => setBusy(false));
  }, [days]);

  useEffect(load, [load]);

  const t = data?.totals;
  const p = data?.previous;

  return (
    <div className="admin-wrap">
      <header className="admin-top">
        <h1>Search</h1>
        <div>
          <button className="btn ghost" onClick={load} disabled={busy}>
            {busy ? 'Loading…' : 'Refresh'}
          </button>
          <button className="btn ghost" onClick={onBack}>Back to posts</button>
        </div>
      </header>

      <div className="gsc-controls">
        {RANGES.map((r) => (
          <button
            key={r.days}
            className={`btn sm ${days === r.days ? '' : 'ghost'}`}
            onClick={() => setDays(r.days)}
          >
            {r.label}
          </button>
        ))}
        {data && (
          <span className="muted sm gsc-range">
            {data.range.startDate} to {data.range.endDate} · {data.siteUrl}
          </span>
        )}
      </div>

      {unconfigured ? (
        <NotConfigured detail={err} />
      ) : (
        <>
          {err && <div className="err">{err}</div>}
          {!data && busy && <p className="muted">Loading…</p>}
          {data && (
            <>
              <div className="gsc-stats">
                <Stat label="Clicks" value={nf.format(t.clicks)} now={t.clicks} before={p.clicks} />
                <Stat label="Impressions" value={nf.format(t.impressions)} now={t.impressions} before={p.impressions} />
                <Stat label="Average CTR" value={pct(t.ctr)} now={t.ctr} before={p.ctr} />
                <Stat label="Average position" value={t.position.toFixed(1)} now={t.position} before={p.position} invert />
              </div>

              <div className="gsc-charts">
                <TrendChart title="Clicks" rows={data.byDate} dataKey="clicks" format={(v) => nf.format(v)} />
                <TrendChart title="Impressions" rows={data.byDate} dataKey="impressions" format={(v) => nf.format(v)} />
              </div>

              <div className="gsc-tables">
                <RankTable title="Top queries" rows={data.queries} />
                <RankTable title="Top pages" rows={data.pages} linkify />
              </div>

              <div className="gsc-tables">
                <RankTable title="Countries" rows={data.countries} />
                <RankTable title="Devices" rows={data.devices} />
              </div>

              <p className="muted sm">
                Search Console finalises data about two days late, so this window
                ends {data.range.endDate}, not today.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
