import { useEffect, useRef, useState } from 'react';

/**
 * Debounce a rapidly-changing value.
 * Returns the debounced value which only updates after `delay` ms of
 * inactivity on the source value.
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

/**
 * Returns a debounced callback. The callback only fires after `delay` ms
 * since the last invocation.
 */
export function useDebouncedCallback(callback, delay = 400) {
  const ref = useRef(null);

  useEffect(() => () => clearTimeout(ref.current), []);

  return (...args) => {
    clearTimeout(ref.current);
    ref.current = setTimeout(() => callback(...args), delay);
  };
}
