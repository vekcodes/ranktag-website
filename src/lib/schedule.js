// Europe/London <-> UTC helpers for scheduled publishing.
//
// The CMS is operated from the UK, so the author thinks in London wall-clock
// time and the database stores UTC. Everything here uses the platform Intl
// API — no date library, and GMT/BST is whatever the tz database says it was
// on that particular date, not a hardcoded offset.
const TZ = 'Europe/London';

const PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ, hour12: false,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
});

function partsAt(ts) {
  const out = {};
  for (const p of PARTS.formatToParts(new Date(ts))) out[p.type] = p.value;
  // Intl renders midnight as "24" in some engines; normalise it.
  if (out.hour === '24') out.hour = '00';
  return out;
}

/** London's UTC offset in ms at a given instant (+3600000 during BST). */
function offsetAt(ts) {
  const p = partsAt(ts);
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ts;
}

/**
 * London wall-clock date + time -> a UTC Date.
 * Two passes: guess the offset from the naive instant, then re-check with the
 * corrected one. That settles the DST boundaries, where the first guess can
 * land on the wrong side of the clock change.
 */
export function londonToUtc(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const naive = Date.parse(`${dateStr}T${timeStr}:00Z`);
  if (Number.isNaN(naive)) return null;
  let ts = naive - offsetAt(naive);
  ts = naive - offsetAt(ts);
  return new Date(ts);
}

/** A UTC instant -> { date: 'YYYY-MM-DD', time: 'HH:MM' } in London. */
export function utcToLondonFields(value) {
  const ts = value instanceof Date ? value.getTime() : Date.parse(value);
  if (Number.isNaN(ts)) return { date: '', time: '' };
  const p = partsAt(ts);
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** 'GMT' or 'BST' for the given instant (defaults to now). */
export function londonTzLabel(value = Date.now()) {
  const ts = value instanceof Date ? value.getTime() : Date.parse(value);
  const safe = Number.isNaN(ts) ? Date.now() : ts;
  const part = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, timeZoneName: 'short' })
    .formatToParts(new Date(safe))
    .find((p) => p.type === 'timeZoneName');
  return part ? part.value : 'GMT';
}

/** e.g. "Tue 29 Sep, 09:00 BST" */
export function formatLondon(value) {
  const ts = value instanceof Date ? value.getTime() : Date.parse(value);
  if (Number.isNaN(ts)) return '';
  const d = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short',
  }).format(new Date(ts));
  const t = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(ts));
  return `${d}, ${t} ${londonTzLabel(ts)}`;
}

/** e.g. "in 6 days", "in 12 minutes", "3 minutes ago". */
export function relativeTo(value, from = Date.now()) {
  const ts = value instanceof Date ? value.getTime() : Date.parse(value);
  if (Number.isNaN(ts)) return '';
  const rtf = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });
  const diff = ts - from;
  const abs = Math.abs(diff);
  const MIN = 60000, HOUR = 3600000, DAY = 86400000;
  if (abs < MIN) return rtf.format(Math.round(diff / 1000), 'second');
  if (abs < HOUR) return rtf.format(Math.round(diff / MIN), 'minute');
  if (abs < DAY) return rtf.format(Math.round(diff / HOUR), 'hour');
  if (abs < DAY * 30) return rtf.format(Math.round(diff / DAY), 'day');
  return rtf.format(Math.round(diff / (DAY * 30)), 'month');
}

/** The next round hour from now, as London form fields — the picker default. */
export function nextRoundHourFields(from = Date.now()) {
  const HOUR = 3600000;
  return utcToLondonFields(new Date(Math.ceil((from + 1) / HOUR) * HOUR));
}
