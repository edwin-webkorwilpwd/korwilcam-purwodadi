/**
 * Client-side Rate Limiter & Brute-Force Protection Utility
 * Backed by in-memory state and sessionStorage/localStorage to persist
 * rate limits across accidental browser refreshes.
 */

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
  totalAttempts: number;
}

interface RateLimitRecord {
  timestamps: number[];
  lockoutUntil?: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

function getStorageKey(key: string): string {
  return `korwil_rl_${key}`;
}

function loadRecord(key: string): RateLimitRecord {
  // Check memory store first
  if (memoryStore.has(key)) {
    return memoryStore.get(key)!;
  }

  // Fallback to sessionStorage
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const raw = sessionStorage.getItem(getStorageKey(key));
      if (raw) {
        const parsed: RateLimitRecord = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.timestamps)) {
          memoryStore.set(key, parsed);
          return parsed;
        }
      }
    } catch {}
  }

  return { timestamps: [] };
}

function saveRecord(key: string, record: RateLimitRecord): void {
  memoryStore.set(key, record);
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      sessionStorage.setItem(getStorageKey(key), JSON.stringify(record));
    } catch {}
  }
}

/**
 * Checks if the action is currently permitted under the rate limit.
 * Does NOT increment attempt count.
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const record = loadRecord(key);

  // Check active lockout
  if (record.lockoutUntil && record.lockoutUntil > now) {
    const retryAfter = Math.ceil((record.lockoutUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: retryAfter,
      totalAttempts: record.timestamps.length
    };
  }

  // Clean old timestamps outside the window
  const windowMs = windowSeconds * 1000;
  const recent = record.timestamps.filter((t) => now - t < windowMs);

  const remaining = Math.max(0, maxAttempts - recent.length);
  return {
    allowed: recent.length < maxAttempts,
    remainingAttempts: remaining,
    retryAfterSeconds: remaining === 0 ? windowSeconds : 0,
    totalAttempts: recent.length
  };
}

/**
 * Records an attempt and evaluates rate limit thresholds.
 * If attempt count reaches or exceeds maxAttempts, enforces a lockout.
 */
export function recordAttempt(
  key: string,
  maxAttempts: number,
  windowSeconds: number,
  lockoutSeconds = windowSeconds
): RateLimitResult {
  const now = Date.now();
  const record = loadRecord(key);

  // If already locked out, keep lockout active
  if (record.lockoutUntil && record.lockoutUntil > now) {
    const retryAfter = Math.ceil((record.lockoutUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: retryAfter,
      totalAttempts: record.timestamps.length
    };
  }

  const windowMs = windowSeconds * 1000;
  const recent = record.timestamps.filter((t) => now - t < windowMs);
  recent.push(now);

  let lockoutUntil: number | undefined;
  let allowed = true;
  let retryAfter = 0;

  if (recent.length >= maxAttempts) {
    allowed = false;
    lockoutUntil = now + lockoutSeconds * 1000;
    retryAfter = lockoutSeconds;
  }

  const newRecord: RateLimitRecord = {
    timestamps: recent,
    lockoutUntil
  };

  saveRecord(key, newRecord);

  return {
    allowed,
    remainingAttempts: Math.max(0, maxAttempts - recent.length),
    retryAfterSeconds: retryAfter,
    totalAttempts: recent.length
  };
}

/**
 * Resets the rate limit tracker for a key (e.g. after successful login).
 */
export function resetRateLimit(key: string): void {
  memoryStore.delete(key);
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      sessionStorage.removeItem(getStorageKey(key));
    } catch {}
  }
}
