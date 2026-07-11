import { useEffect, useState } from "react";

/** Debounce nilai apapun. Dipakai untuk search box biar gak nembak API tiap ketikan. */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
