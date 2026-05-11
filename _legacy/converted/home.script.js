/* — Nav scroll state — */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 8) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });

  /* — Reveal on scroll — */
  const reveals = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.05 });
  reveals.forEach(el => io.observe(el));

  /* — FAQ accordion — */
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* — Pipeline tabs (visual only — keep hint of more) — */
  document.querySelectorAll('.pipeline-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pipeline-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
