/**
 * API Retry Logic Utility
 * Provides intelligent retry mechanisms for failed API calls
 */

import {
  logError,
  createAppError,
  ErrorCategory,
  ErrorSeverity,
  type ErrorContext,
} from './errorTracking';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
  context?: ErrorContext;
}

const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'shouldRetry' | 'onRetry' | 'context'>> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt);
  const delay = Math.min(exponentialDelay, maxDelay);
  // Add jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.max(0, delay + jitter);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable based on status code
 */
function isRetryableHttpError(error: any, retryableStatuses: number[]): boolean {
  if (error.response?.status) {
    return retryableStatuses.includes(error.response.status);
  }
  if (error.status) {
    return retryableStatuses.includes(error.status);
  }
  return false;
}

/**
 * Check if error is a network error
 */
function isNetworkError(error: any): boolean {
  return (
    error.message?.includes('fetch failed') ||
    error.message?.includes('network') ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ETIMEDOUT'
  );
}

/**
 * Default retry condition
 */
function shouldRetryByDefault(
  error: any,
  retryableStatuses: number[]
): boolean {
  return (
    isNetworkError(error) ||
    isRetryableHttpError(error, retryableStatuses) ||
    error.name === 'TimeoutError' ||
    error.message?.includes('timeout')
  );
}

/**
 * Retry an async function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries,
    initialDelay,
    maxDelay,
    backoffMultiplier,
    retryableStatuses,
  } = { ...DEFAULT_RETRY_OPTIONS, ...options };

  let lastError: Error;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const shouldRetry = options.shouldRetry
        ? options.shouldRetry(lastError, attempt)
        : shouldRetryByDefault(lastError, retryableStatuses);

      if (!shouldRetry || attempt >= maxRetries) {
        // Log final failure
        const appError = createAppError(
          `Operation failed after ${attempt} attempts: ${lastError.message}`,
          {
            category: ErrorCategory.API,
            severity: ErrorSeverity.HIGH,
            context: {
              ...options.context,
              metadata: {
                attempts: attempt + 1,
                maxRetries,
              },
            },
            originalError: lastError,
          }
        );
        logError(appError);
        throw lastError;
      }

      // Calculate delay and wait
      const delay = calculateDelay(
        attempt,
        initialDelay,
        maxDelay,
        backoffMultiplier
      );

      // Call retry callback
      options.onRetry?.(lastError, attempt);

      // Log retry attempt
      if (process.env.NODE_ENV === 'development') {
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
          error: lastError.message,
        });
      }

      await sleep(delay);
      attempt++;
    }
  }

  throw lastError!;
}

/**
 * Retry a fetch request
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & { retry?: RetryOptions } = {}
): Promise<Response> {
  const { retry, ...fetchOptions } = options;

  return withRetry(
    async () => {
      const response = await fetch(url, fetchOptions);

      // Check if response is ok
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).response = response;
        (error as any).status = response.status;
        throw error;
      }

      return response;
    },
    {
      ...retry,
      context: {
        ...retry?.context,
        action: `fetch ${fetchOptions.method || 'GET'} ${url}`,
      },
    }
  );
}

/**
 * Retry a Supabase query
 */
export async function supabaseWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: any }> {
  return withRetry(
    async () => {
      const result = await queryFn();

      // Supabase returns errors in the error field
      if (result.error) {
        const error = new Error(result.error.message || 'Supabase query failed');
        (error as any).supabaseError = result.error;
        throw error;
      }

      return result;
    },
    {
      maxRetries: 2, // Fewer retries for database operations
      ...options,
      shouldRetry: (error: any, attempt: number) => {
        // Don't retry on auth errors or constraint violations
        if (
          error.supabaseError?.code === 'PGRST301' || // Auth error
          error.supabaseError?.code?.startsWith('23') // Constraint violation
        ) {
          return false;
        }

        // Use custom retry logic if provided
        if (options.shouldRetry) {
          return options.shouldRetry(error, attempt);
        }

        // Retry on network errors and timeouts
        return isNetworkError(error) || error.message?.includes('timeout');
      },
    }
  );
}

/**
 * Batch retry - retry multiple operations with circuit breaker pattern
 */
export class RetryCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold = 5,
    private resetTimeout = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>, retryOptions?: RetryOptions): Promise<T> {
    // Check circuit state
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.resetTimeout) {
        throw createAppError('Circuit breaker is open', {
          category: ErrorCategory.API,
          severity: ErrorSeverity.HIGH,
          userMessage: 'Service temporarily unavailable. Please try again later.',
        });
      }
      this.state = 'half-open';
    }

    try {
      const result = await withRetry(fn, retryOptions);
      // Success - reset circuit
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      return result;
    } catch (error) {
      // Failure - update circuit
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.failureThreshold) {
        this.state = 'open';
      }

      throw error;
    }
  }

  reset() {
    this.state = 'closed';
    this.failures = 0;
    this.lastFailureTime = 0;
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Global circuit breakers for different services
export const apiCircuitBreaker = new RetryCircuitBreaker(5, 60000);
export const databaseCircuitBreaker = new RetryCircuitBreaker(3, 30000);
