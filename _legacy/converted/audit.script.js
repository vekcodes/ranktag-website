/* — Nav scroll state — */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 8) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

/* — URL form submission + simulated analysis — */
const form = document.getElementById('urlForm');
const input = document.getElementById('urlInput');
const submit = document.getElementById('urlSubmit');
const analyzing = document.getElementById('analyzing');
const report = document.getElementById('report');
const targetUrlEl = document.getElementById('targetUrl');
const reportDomainTagEl = document.getElementById('reportDomainTag');
const elapsedTimeEl = document.getElementById('elapsedTime');

function cleanUrl(raw){
  let u = raw.trim().replace(/^https?:\/\//,'').replace(/\/$/,'');
  return u || 'yoursaas.com';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const domain = cleanUrl(input.value);

  // Update display
  targetUrlEl.textContent = 'https://' + domain;
  reportDomainTagEl.textContent = 'REPORT FOR · ' + domain;

  // Hide hero, show analyzing
  document.querySelector('.tool-hero').style.display = 'none';
  document.querySelector('.examples').style.display = 'none';
  analyzing.classList.add('visible');
  report.classList.remove('visible');

  // Reset all steps
  const steps = document.querySelectorAll('.analyzing-step');
  steps.forEach(s => { s.classList.remove('active', 'done'); });

  // Scroll to top of analyzing card
  setTimeout(() => {
    analyzing.scrollIntoView({behavior:'smooth', block:'start'});
  }, 50);

  // Run timer
  let elapsed = 0;
  const timer = setInterval(() => {
    elapsed++;
    const m = String(Math.floor(elapsed/60)).padStart(2,'0');
    const s = String(elapsed%60).padStart(2,'0');
    elapsedTimeEl.textContent = `${m}:${s}`;
  }, 1000);

  // Sequence steps
  const stepDurations = [1400, 1700, 2100, 2400, 1800, 1400];
  let cumulative = 0;

  steps.forEach((step, i) => {
    setTimeout(() => {
      step.classList.add('active');
    }, cumulative);
    cumulative += stepDurations[i];
    setTimeout(() => {
      step.classList.remove('active');
      step.classList.add('done');
      step.querySelector('.step-ic').textContent = '✓';
    }, cumulative);
  });

  // Show report
  setTimeout(() => {
    clearInterval(timer);
    analyzing.classList.remove('visible');
    report.classList.add('visible');
    setTimeout(() => {
      report.scrollIntoView({behavior:'smooth', block:'start'});
    }, 100);

    // Animate score bars
    const bars = ['techBar','contentBar','geoBar','convBar'];
    bars.forEach((id, i) => {
      const el = document.getElementById(id);
      const target = el.style.width;
      el.style.width = '0%';
      setTimeout(() => { el.style.width = target; }, 200 + i*100);
    });
  }, cumulative + 200);
});
