/**
 * Error Tracking and Monitoring Utilities
 * Provides centralized error logging, reporting, and user-friendly error handling
 */

import * as Sentry from '@sentry/nextjs';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  AUTH = 'authentication',
  API = 'api',
  DATABASE = 'database',
  PAYMENT = 'payment',
  NETWORK = 'network',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  route?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface AppError extends Error {
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: ErrorContext;
  userMessage?: string;
  recoverable?: boolean;
  retryable?: boolean;
}

/**
 * Create a structured application error
 */
export function createAppError(
  message: string,
  options: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    context?: ErrorContext;
    userMessage?: string;
    recoverable?: boolean;
    retryable?: boolean;
    originalError?: Error;
  } = {}
): AppError {
  const error = new Error(message) as AppError;
  error.category = options.category || ErrorCategory.UNKNOWN;
  error.severity = options.severity || ErrorSeverity.MEDIUM;
  error.context = options.context;
  error.userMessage = options.userMessage || 'An unexpected error occurred';
  error.recoverable = options.recoverable ?? true;
  error.retryable = options.retryable ?? false;

  if (options.originalError) {
    error.stack = options.originalError.stack;
    error.cause = options.originalError;
  }

  return error;
}

/**
 * Log error to console and Sentry
 */
export function logError(error: Error | AppError, context?: ErrorContext) {
  const appError = error as AppError;
  
  // Console logging (development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      category: appError.category,
      severity: appError.severity,
      context: { ...appError.context, ...context },
      stack: error.stack,
    });
  }

  // Sentry logging (production)
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      level: mapSeverityToSentryLevel(appError.severity),
      tags: {
        category: appError.category,
        recoverable: appError.recoverable?.toString(),
        retryable: appError.retryable?.toString(),
      },
      contexts: {
        app: {
          ...appError.context,
          ...context,
        },
      },
    });
  }
}

/**
 * Log error with additional context
 */
export function logErrorWithContext(
  error: Error,
  category: ErrorCategory,
  context: ErrorContext
) {
  const appError = createAppError(error.message, {
    category,
    context,
    originalError: error,
  });
  logError(appError);
}

/**
 * Map error severity to Sentry severity level
 */
function mapSeverityToSentryLevel(
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): Sentry.SeverityLevel {
  switch (severity) {
    case ErrorSeverity.LOW:
      return 'info';
    case ErrorSeverity.MEDIUM:
      return 'warning';
    case ErrorSeverity.HIGH:
      return 'error';
    case ErrorSeverity.CRITICAL:
      return 'fatal';
    default:
      return 'error';
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: Error | AppError): string {
  const appError = error as AppError;

  // Return custom user message if available
  if (appError.userMessage) {
    return appError.userMessage;
  }

  // Return category-specific messages
  switch (appError.category) {
    case ErrorCategory.AUTH:
      return 'Authentication failed. Please sign in again.';
    case ErrorCategory.API:
      return 'Unable to connect to the server. Please try again.';
    case ErrorCategory.DATABASE:
      return 'Unable to retrieve data. Please try again later.';
    case ErrorCategory.PAYMENT:
      return 'Payment processing failed. Please try again or contact support.';
    case ErrorCategory.NETWORK:
      return 'Network connection lost. Please check your internet connection.';
    case ErrorCategory.VALIDATION:
      return 'Invalid input. Please check your information and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error | AppError): boolean {
  const appError = error as AppError;
  
  if (appError.retryable !== undefined) {
    return appError.retryable;
  }

  // Network and API errors are typically retryable
  return (
    appError.category === ErrorCategory.NETWORK ||
    appError.category === ErrorCategory.API
  );
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  } else {
    console.log('Breadcrumb:', { message, category, data });
  }
}

/**
 * Capture custom message (non-error)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, {
      level,
      contexts: { custom: context },
    });
  } else {
    console.log(`[${level.toUpperCase()}]`, message, context);
  }
}

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logErrorWithContext(
        error instanceof Error ? error : new Error(String(error)),
        ErrorCategory.UNKNOWN,
        context
      );
      throw error;
    }
  }) as T;
}
