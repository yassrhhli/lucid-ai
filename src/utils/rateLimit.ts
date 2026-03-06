// Rate limiter côté client pour éviter les doubles appels accidentels

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const limiters = new Map<string, RateLimitEntry>();

/**
 * Vérifie si une action est autorisée dans la fenêtre de temps donnée.
 * @param key Identifiant unique de l'action (ex: 'interpret:dreamId')
 * @param maxCalls Nombre max d'appels autorisés dans la fenêtre
 * @param windowMs Durée de la fenêtre en ms
 */
export function checkRateLimit(
  key: string,
  maxCalls: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = limiters.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    limiters.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= maxCalls) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * Debounce — retourne une version debounced de la fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Guard pour les actions critiques (achat, suppression)
 * Empêche le double-tap
 */
export function createActionGuard() {
  let inProgress = false;
  return async (fn: () => Promise<void>): Promise<void> => {
    if (inProgress) return;
    inProgress = true;
    try {
      await fn();
    } finally {
      inProgress = false;
    }
  };
}
