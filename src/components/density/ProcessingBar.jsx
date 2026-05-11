/**
 * Top processing status bar — shows session state and live indicator.
 */
export default function ProcessingBar({ sessionId, loading, result, error }) {
  return (
    <div className="ds-proc-bar">
      <div className="ds-proc-left">
        {sessionId ? (
          <span className="tag tag-live">Live Session</span>
        ) : (
          <span className="tag tag-outline">Connecting...</span>
        )}
        {sessionId && (
          <span className="ds-proc-sid mono">{sessionId}</span>
        )}
      </div>
      <div className="ds-proc-right">
        {loading && <span className="ds-proc-spinner" />}
        {error && <span className="ds-proc-error">Error: {error}</span>}
        {result && !loading && (
          <span className="ds-proc-speed mono">
            {result.processing.total_processing_ms < 1 ? '<1' : Math.round(result.processing.total_processing_ms)} ms
            {!result.processing.is_full_reprocess && result.processing.reprocessed_blocks < result.processing.total_blocks && (
              <> &middot; {result.processing.reprocessed_blocks}/{result.processing.total_blocks} blocks</>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
