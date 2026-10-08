import { useEffect, useState } from 'react';

type StoredValueParser<T> = (value: unknown) => T | null;

function readStoredValue<T>(key: string, fallback: T, parse?: StoredValueParser<T>): T {
  try {
    const rawValue = localStorage.getItem(key);
    if (rawValue === null) {
      return fallback;
    }

    const value = JSON.parse(rawValue);
    return parse ? parse(value) ?? fallback : value as T;
  } catch {
    return fallback;
  }
}

export function usePersistentState<T>(
  key: string,
  initialValue: T,
  parse?: StoredValueParser<T>,
) {
  const [value, setValue] = useState<T>(() => readStoredValue(key, initialValue, parse));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable or full; keep the in-memory state usable.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
