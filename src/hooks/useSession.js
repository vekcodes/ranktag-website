import { useCallback, useEffect, useRef, useState } from 'react';
import { sessionCreate, sessionAnalyze, sessionReset, sessionDelete } from '../lib/densityApi';

/**
 * Manages a real-time analysis session (Step 4 backend).
 *
 * Handles session creation, incremental analysis, and cleanup.
 * Returns { sessionId, result, error, loading, analyze, reset }.
 */
export function useSession() {
  const [sessionId, setSessionId] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef(null);
  const mountedRef = useRef(true);

  // Create session on mount
  useEffect(() => {
    mountedRef.current = true;
    let sid = null;

    sessionCreate()
      .then((res) => {
        if (!mountedRef.current) return;
        sid = res.session_id;
        sessionRef.current = sid;
        setSessionId(sid);
      })
      .catch((e) => {
        if (mountedRef.current) setError(e.message);
      });

    return () => {
      mountedRef.current = false;
      if (sid) sessionDelete(sid).catch(() => {});
    };
  }, []);

  const analyze = useCallback(async (content, opts = {}) => {
    const sid = sessionRef.current;
    if (!sid || !content?.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await sessionAnalyze(sid, content, opts);
      if (mountedRef.current) setResult(res);
    } catch (e) {
      if (mountedRef.current) setError(e.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const reset = useCallback(async () => {
    const sid = sessionRef.current;
    if (!sid) return;
    try {
      await sessionReset(sid);
      if (mountedRef.current) {
        setResult(null);
        setError(null);
      }
    } catch (e) {
      if (mountedRef.current) setError(e.message);
    }
  }, []);

  return { sessionId, result, error, loading, analyze, reset };
}
