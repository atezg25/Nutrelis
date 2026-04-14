/**
 * Rate limiter en mémoire — protection contre le spam/brute force.
 * Fonctionne par IP, avec fenêtre glissante.
 *
 * Usage :
 *   const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
 *   const { allowed } = limiter.check(ip);
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  /** Nombre max de requêtes par fenêtre */
  maxRequests: number;
  /** Durée de la fenêtre en ms */
  windowMs: number;
}

interface RateLimiter {
  check: (key: string) => { allowed: boolean; remaining: number; resetAt: number };
}

const store = new Map<string, RateLimitEntry>();

// Nettoyage périodique des entrées expirées (toutes les 60s)
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60_000);
}

export function createRateLimiter(opts: RateLimiterOptions): RateLimiter {
  scheduleCleanup();

  return {
    check(key: string) {
      const now = Date.now();
      const storeKey = `${opts.maxRequests}:${opts.windowMs}:${key}`;
      const entry = store.get(storeKey);

      if (!entry || now > entry.resetAt) {
        store.set(storeKey, { count: 1, resetAt: now + opts.windowMs });
        return { allowed: true, remaining: opts.maxRequests - 1, resetAt: now + opts.windowMs };
      }

      entry.count++;
      if (entry.count > opts.maxRequests) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
      }

      return { allowed: true, remaining: opts.maxRequests - entry.count, resetAt: entry.resetAt };
    },
  };
}

/** Extraire l'IP du client depuis les headers Next.js */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
