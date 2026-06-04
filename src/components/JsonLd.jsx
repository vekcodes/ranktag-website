/**
 * Renders schema.org JSON-LD into the document body so it is present in the
 * pre-rendered static HTML (and survives hydration unchanged). Accepts a single
 * node or an array of nodes; emits one <script type="application/ld+json"> per
 * node — matching how the blog SSR route (api/_lib/render.js) emits its schema.
 *
 * `<` is escaped to its < unicode form so a string value can never close
 * the <script> early. JSON.stringify is deterministic for a given object, so the
 * server and client render byte-identical output (no hydration mismatch).
 */
export default function JsonLd({ data }) {
  const nodes = (Array.isArray(data) ? data : [data]).filter(Boolean);
  return (
    <>
      {nodes.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(node).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
