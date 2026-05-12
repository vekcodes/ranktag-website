import { useEffect } from 'react';

/**
 * Per-route meta updater for a Vite SPA.
 *
 * Updates <title>, <meta name="description">, <link rel="canonical">, and
 * the og:/twitter: equivalents so each route gets crawlable, SERP-ready
 * metadata. Google fully indexes JS-rendered pages, and Bing prefers seeing
 * the right meta in the head — this hook satisfies both.
 *
 * Pass `jsonLd` for a page-specific schema.org block injected as a
 * <script type="application/ld+json"> with id `ld-page`. The previous block
 * (if any) is replaced on each route change.
 */
export default function usePageMeta({ title, description, canonical, jsonLd } = {}) {
  useEffect(() => {
    if (title) document.title = title;

    const setMeta = (selector, attr, content) => {
      if (!content) return;
      let tag = document.head.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        const [a, b] = selector.replace(/[[\]"]/g, '').split('=');
        tag.setAttribute(a, b);
        document.head.appendChild(tag);
      }
      tag.setAttribute(attr, content);
    };

    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
      setMeta('meta[name="twitter:description"]', 'content', description);
    }
    if (title) {
      setMeta('meta[property="og:title"]', 'content', title);
      setMeta('meta[name="twitter:title"]', 'content', title);
    }
    if (canonical) {
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
      setMeta('meta[property="og:url"]', 'content', canonical);
    }

    let ldNode = null;
    if (jsonLd) {
      ldNode = document.getElementById('ld-page');
      if (!ldNode) {
        ldNode = document.createElement('script');
        ldNode.type = 'application/ld+json';
        ldNode.id = 'ld-page';
        document.head.appendChild(ldNode);
      }
      ldNode.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      const existing = document.getElementById('ld-page');
      if (existing) existing.remove();
    };
  }, [title, description, canonical, jsonLd]);
}
