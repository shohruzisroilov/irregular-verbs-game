// LocalStorage helpers. Every read is guarded: a single corrupt entry used to
// throw inside the mount effect and leave the app stuck on the loading screen.

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or a full quota: losing progress is better than crashing.
  }
}

export function removeKeys(keys: string[]) {
  if (typeof window === 'undefined') return;
  try {
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore.
  }
}
