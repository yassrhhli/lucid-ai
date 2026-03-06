import { Alert } from 'react-native';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public userFacing?: boolean
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, context?: string): string {
  const prefix = context ? `[${context}]` : '';

  if (error instanceof AppError) {
    console.error(`${prefix} AppError:`, error.message, error.code);
    return error.message;
  }

  if (error instanceof Error) {
    console.error(`${prefix} Error:`, error.message);

    // Mapper les erreurs Supabase communes
    const supabaseMessages: Record<string, string> = {
      'Invalid login credentials': 'Incorrect email or password.',
      'Email not confirmed': 'Please verify your email address first.',
      'User already registered': 'An account with this email already exists.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters.',
      'CHECK_EMAIL': 'Please check your email to confirm your account.',
      'JWT expired': 'Your session has expired. Please sign in again.',
      'Network request failed': 'No internet connection. Please try again.',
    };

    for (const [key, msg] of Object.entries(supabaseMessages)) {
      if (error.message.includes(key)) return msg;
    }

    return error.message;
  }

  console.error(`${prefix} Unknown error:`, error);
  return 'An unexpected error occurred. Please try again.';
}

export function showErrorAlert(error: unknown, title = 'Error', context?: string): void {
  const message = handleError(error, context);
  Alert.alert(title, message, [{ text: 'OK' }]);
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Network request failed') ||
      error.message.includes('fetch failed') ||
      error.message.includes('timeout')
    );
  }
  return false;
}
