/**
 * Sanitize les inputs avant envoi à Supabase ou OpenAI.
 * Protège contre les injections SQL, prompt injection, XSS.
 */

// Caractères dangereux pour les prompts IA
const PROMPT_INJECTION_PATTERNS = [
  /ignore (previous|all) instructions/gi,
  /system prompt/gi,
  /\[INST\]/gi,
  /<\|.*?\|>/gi,
  /###\s*(instruction|system)/gi,
];

export function sanitizeDreamContent(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let cleaned = input
    // Supprimer les null bytes
    .replace(/\0/g, '')
    // Normaliser les espaces multiples
    .replace(/[ \t]{3,}/g, '  ')
    // Limiter les sauts de ligne consécutifs
    .replace(/\n{4,}/g, '\n\n\n')
    // Supprimer les caractères de contrôle sauf \n et \t
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();

  // Vérifier les tentatives de prompt injection
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      console.warn('[Security] Prompt injection attempt detected');
      cleaned = cleaned.replace(pattern, '[...]');
    }
  }

  return cleaned;
}

export function sanitizeUsername(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9_\-. ]/g, '')
    .trim()
    .slice(0, 30);
}

export function sanitizeTag(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, '')
    .slice(0, 30);
}

export function sanitizeTitle(input: string): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 100);
}

/**
 * Valide qu'un UUID est bien formé (protection injection)
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valide l'email basique
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
