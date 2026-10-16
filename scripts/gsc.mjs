#!/usr/bin/env node
// Google Search Console from the command line. Also the fastest way to prove
// the service account works before anything is deployed.
//
// Credentials, in order of preference:
//   --key /path/to/service-account.json     explicit, nothing in the env
//   GSC_SERVICE_ACCOUNT_JSON                raw JSON or base64 (same var the API uses)
//   GSC_CLIENT_EMAIL + GSC_PRIVATE_KEY
//
// Usage:
//   node scripts/gsc.mjs sites --key ~/keys/gsc.json
//   node scripts/gsc.mjs overview --days 28
//   node scripts/gsc.mjs queries --days 28 --limit 50
//   node scripts/gsc.mjs pages --days 7 --json > pages.json
//   node scripts/gsc.mjs sitemaps
//
// `--json` prints the raw payload, for piping into anything that wants to do
// its own analysis. Without it you get a readable table.
import { readFileSync } from 'node:fs';
import process from 'node:process';

const argv = process.argv.slice(2);
const command = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'overview';

function flag(name, fallback = null) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

const asJson = Boolean(flag('json', false));
const days = Number.parseInt(flag('days', '28'), 10) || 28;
const limit = Number.parseInt(flag('limit', '25'), 10) || 25;

// A --key file is loaded into the same env var the serverless code reads, so
// the script and production share one credential path instead of two.
const keyPath = flag('key', null);
if (typeof keyPath === 'string') {
  try {
    process.env.GSC_SERVICE_ACCOUNT_JSON = readFileSync(keyPath, 'utf8');
  } catch (e) {
    console.error(`Could not read key file ${keyPath}: ${e.message}`);
    process.exit(1);
  }
}
if (typeof flag('site', null) === 'string') process.env.GSC_SITE_URL = flag('site');

const gsc = await import('../api/_lib/gsc.js');

function pct(n) {
  return `${(n * 100).toFixed(2)}%`;
}

function delta(now, before) {
  if (!before) return now ? '  (new)' : '';
  const change = ((now - before) / before) * 100;
  const sign = change >= 0 ? '+' : '';
  return `  (${sign}${change.toFixed(1)}% vs prev)`;
}

function table(rows, label) {
  if (!rows.length) return console.log(`\n${label}: no data in this window.`);
  const width = Math.min(
    70,
    Math.max(label.length, ...rows.map((r) => String(r.key).length))
  );
  console.log(`\n${label}`);
  console.log(
    `${'-'.repeat(width)}  ${'clicks'.padStart(7)} ${'impr'.padStart(8)} ` +
      `${'ctr'.padStart(7)} ${'pos'.padStart(6)}`
  );
  for (const r of rows) {
    const key = String(r.key);
    const cell = key.length > width ? `${key.slice(0, width - 1)}…` : key.padEnd(width);
    console.log(
      `${cell}  ${String(r.clicks).padStart(7)} ${String(r.impressions).padStart(8)} ` +
        `${pct(r.ctr).padStart(7)} ${r.position.toFixed(1).padStart(6)}`
    );
  }
}

try {
  if (command === 'sites') {
    const sites = await gsc.listSites();
    if (asJson) {
      console.log(JSON.stringify(sites, null, 2));
    } else if (!sites.length) {
      console.log(
        'No properties. The service account is authenticating fine, but has not ' +
          'been added as a user in Search Console -> Settings -> Users and permissions.'
      );
    } else {
      console.log('Properties this service account can read:\n');
      for (const s of sites) console.log(`  ${s.siteUrl}   [${s.permissionLevel}]`);
      console.log(`\nSet GSC_SITE_URL to the one you want as the default.`);
    }
    process.exit(0);
  }

  if (command === 'sitemaps') {
    const maps = await gsc.listSitemaps();
    if (asJson) {
      console.log(JSON.stringify(maps, null, 2));
    } else if (!maps.length) {
      console.log('No sitemaps submitted for this property yet.');
    } else {
      for (const m of maps) {
        console.log(
          `${m.path}\n  submitted ${m.submitted}, indexed ${m.indexed}, ` +
            `errors ${m.errors}, warnings ${m.warnings}` +
            `${m.isPending ? ', still processing' : ''}`
        );
      }
    }
    process.exit(0);
  }

  const data = await gsc.overview(null, { days, limit });

  if (asJson) {
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  }

  const { totals: t, previous: p, range } = data;
  console.log(`\n${data.siteUrl}`);
  console.log(`${range.startDate} to ${range.endDate}  (${range.days} days)\n`);
  console.log(`  Clicks       ${String(t.clicks).padStart(8)}${delta(t.clicks, p.clicks)}`);
  console.log(`  Impressions  ${String(t.impressions).padStart(8)}${delta(t.impressions, p.impressions)}`);
  console.log(`  CTR          ${pct(t.ctr).padStart(8)}`);
  console.log(`  Avg position ${t.position.toFixed(1).padStart(8)}`);

  if (command === 'overview' || command === 'queries') table(data.queries, 'Top queries');
  if (command === 'overview' || command === 'pages') table(data.pages, 'Top pages');
  if (command === 'countries') table(data.countries, 'Countries');
  if (command === 'devices') table(data.devices, 'Devices');
  console.log('');
} catch (e) {
  console.error(`\n${e.message}\n`);
  process.exit(1);
}
