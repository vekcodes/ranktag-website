import { useState } from 'react';

/**
 * Reusable FAQ accordion for tool guide pages.
 * `items` is an array of [question, answer] pairs — the same array should be
 * fed to schema.faqPage() so the visible text matches the FAQPage JSON-LD
 * (required for rich-result eligibility).
 */
export default function ToolFaq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="dg-faq">
      {items.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div className={`dg-faq-item ${isOpen ? 'open' : ''}`} key={q}>
            {/* The question is an <h3> wrapping the toggle, under the
                section's <h2>: each Q&A is a real subsection and belongs in
                the document outline. The heading wraps the button rather than
                sitting inside it — a <button> only takes phrasing content. */}
            <h3 className="dg-faq-qt">
              <button
                className="dg-faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{q}</span>
                <span className="dg-faq-ic" aria-hidden="true">{isOpen ? '–' : '+'}</span>
              </button>
            </h3>
            <div className="dg-faq-a" hidden={!isOpen}>
              <p>{a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
