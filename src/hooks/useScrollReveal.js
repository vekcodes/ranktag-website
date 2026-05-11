import { useEffect } from 'react';

/**
 * Adds the `.in` class to elements with `[data-reveal]` when they enter view.
 * Mirrors the IntersectionObserver behavior from the original static site.
 */
export default function useScrollReveal() {
  useEffect(() => {
    const reveals = document.querySelectorAll('[data-reveal]');
    if (!reveals.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05 }
    );

    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
