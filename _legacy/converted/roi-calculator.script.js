/* — Nav scroll state — */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 8) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

/* ═══ ROI CALCULATOR ═══════════════════════════════════════════════ */

// ----- Helpers -----
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const fmtMoney = (n) => '$' + fmt(n);
const $ = id => document.getElementById(id);

// ----- Presets -----
const PRESETS = {
  seed:   { searches:25000,  ctr:22, conv:3.2, t2p:22, acv:8400,  ltv:2.5, invest:14800 },
  growth: { searches:80000,  ctr:25, conv:3.8, t2p:28, acv:18000, ltv:3.0, invest:24000 },
  scale:  { searches:240000, ctr:28, conv:4.5, t2p:32, acv:36000, ltv:3.5, invest:42000 },
};

// ----- Inputs -----
const inputs = ['searches','ctr','conv','t2p','acv','ltv','invest'];

function readInputs(){
  return {
    searches: +$('searches').value,
    ctr:      +$('ctr').value,
    conv:     +$('conv').value,
    t2p:      +$('t2p').value,
    acv:      +$('acv').value,
    ltv:      +$('ltv').value,
    invest:   +$('invest').value,
  };
}

function paintInputLabels(d){
  $('searchesVal').textContent = fmt(d.searches);
  $('ctrVal').textContent      = d.ctr;
  $('convVal').textContent     = d.conv.toFixed(1);
  $('t2pVal').textContent      = d.t2p;
  $('acvVal').textContent      = fmt(d.acv);
  $('ltvVal').textContent      = d.ltv.toFixed(1);
  $('investVal').textContent   = fmt(d.invest);
}

// ----- ROI math -----
// Build a 12-month projection with realistic ramp curve.
// Months 1-3 are low (foundation building), 4-6 ramp up, 7-12 steady-state compounding.
function project(d){
  const monthlyVisitsAtSteady = d.searches * (d.ctr/100); // top-3 ranking visits/mo at steady state
  const ramp = [0.05, 0.12, 0.22, 0.36, 0.52, 0.68, 0.80, 0.88, 0.93, 0.96, 0.98, 1.00]; // ramp curve

  let cumRev = 0, cumCost = 0;
  const points = [];
  let breakEvenMonth = null;

  for (let m=1; m<=12; m++){
    const visits = monthlyVisitsAtSteady * ramp[m-1];
    const signups = visits * (d.conv/100);
    const customers = signups * (d.t2p/100);
    // For monthly revenue contribution, customer pays ACV/12 each month they're a customer
    // But for simplicity & to match SaaS ROI conventions, recognize ACV*lifespan over time.
    // We'll use: month-of-acquisition revenue = customers_acq * (ACV * ltv) recognized smoothly across remaining months.
    // Simpler: monthly new revenue = customers_acq * ACV (1 year of recognized revenue) + lifespan multiplier on cumulative.
    // For chart clarity: month rev = customers_acq * ACV (annual contract = 1 year of revenue booked at acquisition).

    // Use a more realistic SaaS approach: each new customer brings ACV * lifespan in cumulative LTV
    const monthRev = customers * d.acv * d.ltv;
    const monthCost = d.invest;

    cumRev += monthRev;
    cumCost += monthCost;

    if (breakEvenMonth === null && cumRev >= cumCost){
      breakEvenMonth = m;
    }

    points.push({
      month: m,
      visits,
      signups,
      customers,
      monthRev,
      cumRev,
      monthCost,
      cumCost,
    });
  }

  // Summary stats
  const last = points[11];
  const annualRevenue = last.cumRev;
  const annualSpend = last.cumCost;
  const netProfit = annualRevenue - annualSpend;
  const roiPct = annualSpend > 0 ? Math.round((netProfit / annualSpend) * 100) : 0;
  const monthlyVisits = last.visits;
  const monthlySignups = last.signups;
  const monthlyMRR = last.customers * d.acv / 12; // recurring monthly value of those customers

  return {
    points,
    annualRevenue,
    annualSpend,
    netProfit,
    roiPct,
    monthlyVisits,
    monthlySignups,
    monthlyMRR,
    breakEvenMonth,
  };
}

// ----- Chart rendering -----
const CHART_W = 720, CHART_H = 280;
const CHART_PAD = { top: 20, right: 20, bottom: 20, left: 50 };

function paintChart(proj){
  const points = proj.points;
  // Find max value for scale
  const maxVal = Math.max(...points.map(p => Math.max(p.cumRev, p.cumCost))) * 1.1;

  const innerW = CHART_W - CHART_PAD.left - CHART_PAD.right;
  const innerH = CHART_H - CHART_PAD.top - CHART_PAD.bottom;
  const xStep = innerW / 12;

  function xy(month, val){
    const x = CHART_PAD.left + (month) * xStep;
    const y = CHART_PAD.top + innerH - (val / maxVal) * innerH;
    return [x, y];
  }

  // Y-axis labels (5 gridlines)
  const yLabels = $('yLabels');
  yLabels.innerHTML = '';
  const gridLines = $('gridLines');
  gridLines.innerHTML = '';
  for (let i=0; i<=4; i++){
    const v = (maxVal * i / 4);
    const [_, y] = xy(0, v);
    yLabels.innerHTML += `<text x="40" y="${y+3}" text-anchor="end">${formatY(v)}</text>`;
    gridLines.innerHTML += `<line x1="${CHART_PAD.left}" y1="${y}" x2="${CHART_W - CHART_PAD.right}" y2="${y}"/>`;
  }

  // Build path strings
  const start = xy(0, 0);
  let revPath = `M ${start[0]} ${start[1]}`;
  let revArea = `M ${start[0]} ${start[1]}`;
  let costPath = `M ${start[0]} ${start[1]}`;
  let costArea = `M ${start[0]} ${start[1]}`;

  points.forEach(p => {
    const [rx, ry] = xy(p.month, p.cumRev);
    const [cx, cy] = xy(p.month, p.cumCost);
    revPath += ` L ${rx} ${ry}`;
    revArea += ` L ${rx} ${ry}`;
    costPath += ` L ${cx} ${cy}`;
    costArea += ` L ${cx} ${cy}`;
  });

  const [endX] = xy(12, 0);
  const baseY = CHART_PAD.top + innerH;
  revArea += ` L ${endX} ${baseY} L ${start[0]} ${baseY} Z`;
  costArea += ` L ${endX} ${baseY} L ${start[0]} ${baseY} Z`;

  $('revLine').setAttribute('d', revPath);
  $('revArea').setAttribute('d', revArea);
  $('costLine').setAttribute('d', costPath);
  $('costArea').setAttribute('d', costArea);

  // Break-even marker
  const beMarker = $('breakevenMarker');
  beMarker.innerHTML = '';
  if (proj.breakEvenMonth){
    const p = points[proj.breakEvenMonth - 1];
    const [bx, by] = xy(p.month, p.cumRev);
    beMarker.innerHTML = `
      <line x1="${bx}" y1="${CHART_PAD.top}" x2="${bx}" y2="${baseY}" stroke="#2D8A5C" stroke-dasharray="4,4" stroke-width="1.5"/>
      <circle cx="${bx}" cy="${by}" r="7" fill="#2D8A5C"/>
      <circle cx="${bx}" cy="${by}" r="13" fill="#2D8A5C" opacity=".25"/>
      <text x="${bx + 10}" y="${CHART_PAD.top + 14}" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#2D8A5C">BREAK-EVEN · M${proj.breakEvenMonth}</text>
    `;
  }

  // X-axis labels
  const xAxis = $('xAxis');
  xAxis.innerHTML = '';
  for (let m=0; m<=12; m+=2){
    const lbl = m === 0 ? 'NOW' : `M${m}`;
    xAxis.innerHTML += `<span>${lbl}</span>`;
  }

  // Hover handlers
  setupHover(points, xy, maxVal);
}

function formatY(v){
  if (v >= 1e6) return '$' + (v/1e6).toFixed(1) + 'M';
  if (v >= 1e3) return '$' + Math.round(v/1e3) + 'K';
  return '$' + Math.round(v);
}

function setupHover(points, xy, maxVal){
  const hoverArea = $('hoverArea');
  const hoverLine = $('hoverLine');
  const hoverDotRev = $('hoverDotRev');
  const hoverDotCost = $('hoverDotCost');
  const tooltip = $('chartTooltip');

  hoverArea.onmousemove = function(e){
    const rect = hoverArea.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const monthIdx = Math.min(Math.max(Math.round(xPct * 12), 1), 12);
    const p = points[monthIdx - 1];

    const [rx, ry] = xy(p.month, p.cumRev);
    const [cx, cy] = xy(p.month, p.cumCost);

    hoverLine.style.display = '';
    hoverLine.setAttribute('x1', rx);
    hoverLine.setAttribute('x2', rx);

    hoverDotRev.style.display = '';
    hoverDotRev.setAttribute('cx', rx);
    hoverDotRev.setAttribute('cy', ry);

    hoverDotCost.style.display = '';
    hoverDotCost.setAttribute('cx', cx);
    hoverDotCost.setAttribute('cy', cy);

    tooltip.classList.add('visible');
    // Position tooltip near hover (in viewport pixels)
    const chartRect = hoverArea.closest('.chart-wrap').getBoundingClientRect();
    const svgRect = hoverArea.getBoundingClientRect();
    const tipLeft = (rx / 720) * svgRect.width;
    tooltip.style.left = `${Math.min(Math.max(tipLeft, 80), chartRect.width - 160)}px`;
    tooltip.style.top = `${Math.max((ry / 280) * svgRect.height - 80, 0)}px`;
    tooltip.innerHTML = `
      <span class="tt-month">MONTH ${p.month}</span>
      <div class="tt-row"><span>Revenue</span><strong>${fmtMoney(p.cumRev)}</strong></div>
      <div class="tt-row"><span>Cost</span><strong>${fmtMoney(p.cumCost)}</strong></div>
      <div class="tt-row" style="border-top:1px solid rgba(255,255,255,.15);padding-top:4px;margin-top:4px"><span>Net</span><strong style="color:${p.cumRev >= p.cumCost ? '#FF3B14' : '#FFAFA0'}">${fmtMoney(p.cumRev - p.cumCost)}</strong></div>
    `;
  };
  hoverArea.onmouseleave = function(){
    hoverLine.style.display = 'none';
    hoverDotRev.style.display = 'none';
    hoverDotCost.style.display = 'none';
    tooltip.classList.remove('visible');
  };
}

// ----- Update everything -----
function update(){
  const d = readInputs();
  paintInputLabels(d);
  const p = project(d);

  $('annualRevenue').textContent = fmt(p.annualRevenue);
  $('annualSpend').textContent   = fmt(p.annualSpend);
  $('netProfit').textContent     = fmt(p.netProfit);
  $('roiPct').textContent        = p.roiPct + '%';
  $('monthlyVisits').textContent = fmt(p.monthlyVisits);
  $('monthlySignups').textContent= fmt(p.monthlySignups);
  $('monthlyMRR').textContent    = fmt(p.monthlyMRR);
  $('breakEvenMonth').textContent= p.breakEvenMonth || '—';
  $('startNow').textContent      = fmt(p.annualRevenue);
  // Cost of waiting one quarter (3 months) — equivalent to losing first 3 months of compounding revenue
  const waitedRev = p.points.slice(0, Math.min(3, p.points.length)).reduce((sum, x) => sum + x.monthRev, 0);
  // Interpretation: shifting the curve right by 3 months means losing 3 months of late-stage revenue
  const lateRev = (p.points[11].monthRev + p.points[10].monthRev + p.points[9].monthRev);
  $('costOfWaiting').textContent = fmt(lateRev);

  paintChart(p);
}

// ----- Wire up sliders -----
inputs.forEach(name => {
  $(name).addEventListener('input', update);
});

// ----- Wire up presets -----
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const preset = PRESETS[btn.dataset.preset];
    Object.keys(preset).forEach(k => { $(k).value = preset[k]; });
    update();
  });
});

// ----- Initial paint -----
update();
window.addEventListener('resize', () => paintChart(project(readInputs())));
