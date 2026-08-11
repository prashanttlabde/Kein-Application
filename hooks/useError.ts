/**
 * Error Handling Hooks
 * React hooks for managing errors in components
 */

import { useState, useCallback, useEffect } from 'react';
import {
  createAppError,
  logError,
  getUserFriendlyErrorMessage,
  isRetryableError,
  ErrorCategory,
  ErrorSeverity,
  type AppError,
  type ErrorContext,
} from '@/lib/errorTracking';
import { withRetry, type RetryOptions } from '@/lib/apiRetry';

/**
 * Hook for managing component-level errors
 */
export function useError() {
  const [error, setError] = useState<AppError | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleError = useCallback(
    (
      err: Error | string,
      options?: {
        category?: ErrorCategory;
        severity?: ErrorSeverity;
        context?: ErrorContext;
        userMessage?: string;
      }
    ) => {
      const error =
        typeof err === 'string'
          ? createAppError(err, options)
          : (err as AppError);

      if (options && !(err as AppError).category) {
        error.category = options.category || ErrorCategory.UNKNOWN;
        error.severity = options.severity || ErrorSeverity.MEDIUM;
        error.context = options.context;
        error.userMessage = options.userMessage;
      }

      logError(error);
      setError(error);
      setErrorMessage(getUserFriendlyErrorMessage(error));
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
    setErrorMessage('');
  }, []);

  const canRetry = error ? isRetryableError(error) : false;

  return {
    error,
    errorMessage,
    hasError: !!error,
    handleError,
    clearError,
    canRetry,
  };
}

/**
 * Hook for async operations with automatic error handling
 */
export function useAsyncError<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const { error, errorMessage, hasError, handleError, clearError, canRetry } =
    useError();

  const execute = useCallback(
    async (
      asyncFn: () => Promise<T>,
      options?: {
        category?: ErrorCategory;
        context?: ErrorContext;
        onSuccess?: (data: T) => void;
        onError?: (error: AppError) => void;
      }
    ) => {
      setLoading(true);
      clearError();

      try {
        const result = await asyncFn();
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        handleError(error, {
          category: options?.category,
          context: options?.context,
        });
        options?.onError?.(error as AppError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError, clearError]
  );

  const retry = useCallback(
    async (asyncFn: () => Promise<T>) => {
      return execute(asyncFn);
    },
    [execute]
  );

  return {
    data,
    loading,
    error,
    errorMessage,
    hasError,
    execute,
    retry,
    canRetry,
    clearError,
  };
}

/**
 * Hook for async operations with automatic retry
 */
export function useAsyncWithRetry<T = any>(
  asyncFn: () => Promise<T>,
  options?: {
    retryOptions?: RetryOptions;
    category?: ErrorCategory;
    context?: ErrorContext;
    executeOnMount?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const { error, errorMessage, hasError, handleError, clearError } = useError();

  const execute = useCallback(async () => {
    setLoading(true);
    clearError();

    try {
      const result = await withRetry(asyncFn, {
        ...options?.retryOptions,
        context: options?.context,
      });
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      handleError(error, {
        category: options?.category,
        context: options?.context,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, options, handleError, clearError]);

  useEffect(() => {
    if (options?.executeOnMount) {
      execute();
    }
  }, [options?.executeOnMount]);

  return {
    data,
    loading,
    error,
    errorMessage,
    hasError,
    execute,
    retry: execute,
    clearError,
  };
}

/**
 * Hook for form error handling
 */
export function useFormError() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>('');

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const setError = useCallback((message: string) => {
    setFormError(message);
  }, []);

  const clearError = useCallback(() => {
    setFormError('');
  }, []);

  const clearAll = useCallback(() => {
    setFieldErrors({});
    setFormError('');
  }, []);

  const hasFieldError = useCallback(
    (field: string) => !!fieldErrors[field],
    [fieldErrors]
  );

  const hasAnyError = formError !== '' || Object.keys(fieldErrors).length > 0;

  return {
    fieldErrors,
    formError,
    hasAnyError,
    setFieldError,
    clearFieldError,
    hasFieldError,
    setError,
    clearError,
    clearAll,
  };
}

/**
 * Hook for toast/notification error display
 */
export function useErrorNotification() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      type: 'error' | 'success' | 'warning' | 'info';
      duration?: number;
    }>
  >([]);

  const showError = useCallback((message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type: 'error', duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, []);

  const showSuccess = useCallback((message: string, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type: 'success', duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, []);

  const showWarning = useCallback((message: string, duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type: 'warning', duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, []);

  const showInfo = useCallback((message: string, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type: 'info', duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    dismiss,
    dismissAll,
  };
}
