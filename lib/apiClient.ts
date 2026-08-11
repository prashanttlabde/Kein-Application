/**
 * Enhanced API Client with Retry Logic
 * Use this for all external API calls that need error handling and retry logic
 */

import { 
  fetchWithRetry, 
  supabaseWithRetry, 
  apiCircuitBreaker,
  type RetryOptions 
} from './apiRetry';
import { 
  createAppError, 
  logError, 
  ErrorCategory, 
  ErrorSeverity,
  addBreadcrumb,
  type ErrorContext 
} from './errorTracking';

export interface ApiRequestOptions extends RequestInit {
  retry?: RetryOptions;
  timeout?: number;
  context?: ErrorContext;
}

/**
 * Make an API request with automatic retry and error handling
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { retry, timeout = 30000, context, ...fetchOptions } = options;

  addBreadcrumb('API Request', 'api', {
    url,
    method: options.method || 'GET',
  });

  try {
    // Use circuit breaker to prevent cascading failures
    const response = await apiCircuitBreaker.execute(
      async () => {
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const res = await fetchWithRetry(url, {
            ...fetchOptions,
            signal: controller.signal,
            retry: {
              ...retry,
              context: {
                ...context,
                route: url,
              },
            },
          });
          clearTimeout(timeoutId);
          return res;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      retry
    );

    // Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    const appError = createAppError(
      error instanceof Error ? error.message : 'API request failed',
      {
        category: ErrorCategory.API,
        severity: ErrorSeverity.HIGH,
        context: {
          ...context,
          route: url,
          metadata: {
            method: options.method || 'GET',
            statusText: (error as any).response?.statusText,
          },
        },
        userMessage: 'Failed to connect to the server. Please try again.',
        retryable: true,
        originalError: error instanceof Error ? error : undefined,
      }
    );

    logError(appError);
    throw appError;
  }
}

/**
 * GET request helper
 */
export async function get<T = any>(
  url: string,
  options: Omit<ApiRequestOptions, 'method'> = {}
): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function post<T = any>(
  url: string,
  data?: any,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function put<T = any>(
  url: string,
  data?: any,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function del<T = any>(
  url: string,
  options: Omit<ApiRequestOptions, 'method'> = {}
): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}

/**
 * Enhanced Supabase query wrapper with retry
 */
export async function supabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: {
    retry?: RetryOptions;
    context?: ErrorContext;
    errorMessage?: string;
  } = {}
): Promise<T> {
  addBreadcrumb('Database Query', 'database', {
    context: options.context?.action,
  });

  try {
    const result = await supabaseWithRetry(queryFn, options.retry);

    if (!result.data) {
      throw createAppError('No data returned from query', {
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.MEDIUM,
        context: options.context,
        userMessage: options.errorMessage || 'Failed to retrieve data',
      });
    }

    return result.data;
  } catch (error) {
    const appError = createAppError(
      error instanceof Error ? error.message : 'Database query failed',
      {
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.HIGH,
        context: options.context,
        userMessage: options.errorMessage || 'Failed to retrieve data. Please try again.',
        retryable: false,
        originalError: error instanceof Error ? error : undefined,
      }
    );

    logError(appError);
    throw appError;
  }
}

/**
 * Batch API requests with error handling
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  options: {
    maxConcurrent?: number;
    stopOnError?: boolean;
    context?: ErrorContext;
  } = {}
): Promise<Array<T | Error>> {
  const { maxConcurrent = 5, stopOnError = false } = options;
  const results: Array<T | Error> = [];
  const executing: Promise<void>[] = [];

  for (const [index, requestFn] of requests.entries()) {
    const promise = (async () => {
      try {
        addBreadcrumb('Batch Request', 'api', {
          index,
          total: requests.length,
        });

        const result = await requestFn();
        results[index] = result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        results[index] = err;

        if (stopOnError) {
          throw err;
        }
      }
    })();

    executing.push(promise);

    if (executing.length >= maxConcurrent) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}
