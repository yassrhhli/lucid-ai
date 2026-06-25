import { Alert } from 'react-native';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public userFacing?: boolean,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Map des messages d'erreur Supabase → messages utilisateur
const SUPABASE_ERROR_MAP: Record<string, string> = {
  'Invalid login credentials':              'Incorrect email or password.',
  'Email not confirmed':                    'Please check your email and confirm your account.',
  'User already registered':               'An account with this email already exists.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters.',
  'JWT expired':                            'Your session has expired. Please sign in again.',
  'Network request failed':                 'No internet connection. Please check your connection.',
  'fetch failed':                           'Connection failed. Please try again.',
  'timeout':                                'Request timed out. Please try again.',
  'duplicate key value':                    'This record already exists.',
  'foreign key constraint':                 'Referenced record not found.',
  'permission denied':                      'You don\'t have permission to perform this action.',
};

export function handleError(error: unknown, context?: string): string {
  if (error instanceof AppError && error.userFacing !== false) {
    return error.message;
  }

  if (error instanceof Error) {
    // Chercher un message connu dans la map
    for (const [key, msg] of Object.entries(SUPABASE_ERROR_MAP)) {
      if (error.message.includes(key)) return msg;
    }
    // En développement, retourner le message brut
    if (__DEV__) return `[${context ?? 'Error'}] ${error.message}`;
    return 'Something went wrong. Please try again.';
  }

  return 'An unexpected error occurred.';
}

export function showErrorAlert(error: unknown, title = 'Error', context?: string): void {
  const message = handleError(error, context);
  Alert.alert(title, message, [{ text: 'OK' }]);
}

export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes('Network request failed') ||
    error.message.includes('fetch failed') ||
    error.message.includes('timeout') ||
    error.message.includes('ECONNREFUSED')
  );
}

// Logger conditionnel — rien en production
export const logger = {
  info:  (...args: any[]) => { if (__DEV__) console.log(...args); },
  warn:  (...args: any[]) => { if (__DEV__) console.warn(...args); },
  error: (...args: any[]) => { if (__DEV__) console.error(...args); },
};
