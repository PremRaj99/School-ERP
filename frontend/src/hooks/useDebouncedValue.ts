import { useEffect, useState } from 'react';

/**
 * Delays reflecting `value` until it's stopped changing for `delayMs` — for a server-side search
 * box (ALIGNMENT_PLAN.md 2C/P1) where every keystroke would otherwise fire a new request. Input
 * fields stay bound to the raw, instant value; only the value handed to a query key/queryFn should
 * come from this hook.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
