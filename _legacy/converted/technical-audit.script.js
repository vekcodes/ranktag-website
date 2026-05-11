/* — Nav scroll state — */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 8) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

/* — URL form submission + simulated scan — */
const form = document.getElementById('urlForm');
const input = document.getElementById('urlInput');
const scanning = document.getElementById('scanning');
const report = document.getElementById('report');
const targetUrlEl = document.getElementById('targetUrl');
const reportDomainEl = document.getElementById('reportDomain');
const elapsedEl = document.getElementById('elapsed');
const progressBar = document.getElementById('progressBar');
const progressLabel = document.getElementById('progressLabel');
const progressPct = document.getElementById('progressPct');

function cleanUrl(raw){
  let u = raw.trim().replace(/^https?:\/\//,'').replace(/\/$/,'');
  return u || 'yoursaas.com';
}

const CATEGORY_NAMES = [
  'Crawlability + indexing',
  'Schema + structured data',
  'Performance + Core Web Vitals',
  'Mobile + UX',
  'GEO + LLM readiness',
  'Security + trust signals'
];
const CATEGORY_CHECKS = [8, 9, 7, 6, 10, 7];
const TOTAL_CHECKS = 47;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const domain = cleanUrl(input.value);
  targetUrlEl.textContent = 'https://' + domain;
  reportDomainEl.textContent = 'REPORT FOR · ' + domain;

  // Hide hero + info, show scanning
  document.querySelector('.tool-hero').style.display = 'none';
  document.getElementById('infoStrip').style.display = 'none';
  scanning.classList.add('visible');
  report.classList.remove('visible');

  // Reset all category items
  const cats = document.querySelectorAll('.scan-cat');
  cats.forEach(c => c.classList.remove('active','done'));
  cats.forEach(c => { c.querySelector('.cat-ic').textContent = c.dataset.cat.padStart(2,'0'); });

  // Scroll
  setTimeout(() => {
    scanning.scrollIntoView({behavior:'smooth', block:'start'});
  }, 50);

  // Timer
  let elapsed = 0;
  const timer = setInterval(() => {
    elapsed++;
    const m = String(Math.floor(elapsed/60)).padStart(2,'0');
    const s = String(elapsed%60).padStart(2,'0');
    elapsedEl.textContent = `${m}:${s}`;
  }, 1000);

  // Run progress simulation
  const stepDurations = [1800, 2300, 2000, 1700, 2900, 1900];
  let cumTime = 0;
  let checksDone = 0;

  cats.forEach((cat, i) => {
    const dur = stepDurations[i];

    setTimeout(() => {
      cat.classList.add('active');
      progressLabel.textContent = `Scanning: ${CATEGORY_NAMES[i]}`;
    }, cumTime);

    // Animate progress bar smoothly through this category's checks
    const startChecks = checksDone;
    const endChecks = checksDone + CATEGORY_CHECKS[i];
    const startTime = cumTime;
    const endTime = cumTime + dur;
    const tick = setInterval(() => {
      const now = Date.now() - scanStart;
      if (now >= endTime){
        clearInterval(tick);
      } else if (now >= startTime){
        const t = (now - startTime) / dur;
        const cur = Math.floor(startChecks + t * (endChecks - startChecks));
        const pct = (cur / TOTAL_CHECKS) * 100;
        progressBar.style.width = pct + '%';
        progressPct.textContent = `${cur} / ${TOTAL_CHECKS}`;
      }
    }, 60);

    cumTime += dur;
    checksDone = endChecks;

    setTimeout(() => {
      cat.classList.remove('active');
      cat.classList.add('done');
      cat.querySelector('.cat-ic').textContent = '✓';
    }, cumTime);
  });

  const scanStart = Date.now();

  // Show report
  setTimeout(() => {
    clearInterval(timer);
    progressBar.style.width = '100%';
    progressPct.textContent = `${TOTAL_CHECKS} / ${TOTAL_CHECKS}`;
    progressLabel.textContent = 'Compiling report...';

    setTimeout(() => {
      scanning.classList.remove('visible');
      report.classList.add('visible');
      setTimeout(() => {
        report.scrollIntoView({behavior:'smooth', block:'start'});
      }, 100);

      // Animate score ring (60/100 = 540 - 540*.6 = 216)
      const ring = document.getElementById('scoreRing');
      ring.setAttribute('stroke-dashoffset', '540');
      setTimeout(() => {
        ring.style.transition = 'stroke-dashoffset 1.5s ease-out';
        ring.setAttribute('stroke-dashoffset', '216');
      }, 200);
    }, 600);
  }, cumTime + 200);
});

// — Category accordion —
document.querySelectorAll('.cat-header').forEach(h => {
  h.addEventListener('click', () => {
    h.parentElement.classList.toggle('open');
  });
});
