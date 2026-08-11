# Error Handling - Quick Reference Card

## 🚨 Most Common Use Cases

### 1. Wrap a Page/Component with Error Boundary
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

export default function MyPage() {
  return (
    <ErrorBoundary context="MyPage">
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 2. Make an API Call with Retry
```tsx
import { get, post } from '@/lib/apiClient';

// GET
const users = await get('/api/users');

// POST with options
const result = await post('/api/users', { name: 'John' }, {
  retry: { maxRetries: 3 },
  context: { action: 'create user' }
});
```

### 3. Query Supabase with Retry
```tsx
import { supabaseQuery } from '@/lib/apiClient';
import { supabase } from '@/lib/supabase';

const data = await supabaseQuery(
  () => supabase.from('users').select('*'),
  { 
    errorMessage: 'Failed to load users',
    context: { action: 'fetch users' }
  }
);
```

### 4. Use Error Hook in Component
```tsx
import { useAsyncError } from '@/hooks/useError';

function MyComponent() {
  const { data, loading, error, errorMessage, execute } = useAsyncError();

  const loadData = async () => {
    await execute(
      async () => fetch('/api/data').then(r => r.json()),
      { category: ErrorCategory.API }
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {errorMessage}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

### 5. Show Error Messages
```tsx
import { InlineError, NetworkError } from '@/components/ErrorComponents';

// Inline error (forms)
{error && <InlineError message={error} onDismiss={() => setError('')} />}

// Full error page
{isNetworkError && <NetworkError onRetry={handleRetry} />}
```

### 6. Track User Context (After Login)
```tsx
import { setUserContext } from '@/lib/errorTracking';

// After successful authentication
setUserContext({
  id: user.id,
  email: user.email,
  username: user.username
});
```

### 7. Log Custom Errors
```tsx
import { logError, createAppError, ErrorCategory } from '@/lib/errorTracking';

try {
  await riskyOperation();
} catch (err) {
  const error = createAppError('Operation failed', {
    category: ErrorCategory.API,
    userMessage: 'Unable to complete the operation',
    context: { action: 'risky operation' }
  });
  logError(error);
  throw error;
}
```

## 🎯 Error Categories

| Category | Use For |
|----------|---------|
| `ErrorCategory.AUTH` | Login, logout, permissions |
| `ErrorCategory.API` | External API calls |
| `ErrorCategory.DATABASE` | Supabase queries |
| `ErrorCategory.PAYMENT` | Payment processing |
| `ErrorCategory.NETWORK` | Network failures |
| `ErrorCategory.VALIDATION` | Form validation |

## 📊 Severity Levels

| Level | When to Use |
|-------|-------------|
| `ErrorSeverity.LOW` | Informational, minor issues |
| `ErrorSeverity.MEDIUM` | Expected errors, warnings |
| `ErrorSeverity.HIGH` | Unexpected errors |
| `ErrorSeverity.CRITICAL` | System failures |

## 🔧 Environment Setup

```env
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
```

## 📦 Import Paths

```tsx
// Error boundaries
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthErrorFallback } from '@/components/ErrorBoundary';

// API client
import { get, post, put, del, supabaseQuery } from '@/lib/apiClient';

// Error tracking
import { 
  logError, 
  createAppError, 
  setUserContext,
  ErrorCategory,
  ErrorSeverity 
} from '@/lib/errorTracking';

// Error components
import { 
  NetworkError, 
  AuthenticationError, 
  PaymentError,
  InlineError 
} from '@/components/ErrorComponents';

// Hooks
import { 
  useError, 
  useAsyncError, 
  useFormError 
} from '@/hooks/useError';
```

## 🎨 Error UI Components

```tsx
<NetworkError onRetry={retry} onGoHome={goHome} errorId="123" />
<AuthenticationError onRetry={retry} errorId="123" />
<PaymentError onRetry={retry} errorId="123" />
<DatabaseError onRetry={retry} onGoHome={goHome} errorId="123" />
<GenericError title="Oops!" message="Custom message" />
<InlineError message="Invalid email" onDismiss={clear} />
<SuccessMessage message="Saved!" onDismiss={clear} />
```

## 🔄 Retry Configuration

```tsx
{
  maxRetries: 3,              // Number of retry attempts
  initialDelay: 1000,         // First retry delay (ms)
  maxDelay: 10000,            // Max retry delay (ms)
  backoffMultiplier: 2,       // Exponential backoff
  retryableStatuses: [        // HTTP codes to retry
    408, 429, 500, 502, 503, 504
  ],
  shouldRetry: (error, attempt) => boolean,  // Custom logic
  onRetry: (error, attempt) => void          // Callback
}
```

## 📱 Form Error Handling

```tsx
import { useFormError } from '@/hooks/useError';

const { 
  fieldErrors, 
  formError,
  setFieldError,
  clearFieldError,
  setError,
  clearAll 
} = useFormError();

// Set field error
setFieldError('email', 'Invalid email format');

// Show field error
{fieldErrors.email && <p className="text-red-500">{fieldErrors.email}</p>}

// Set form error
setError('Submission failed. Please try again.');

// Clear all errors
clearAll();
```

## 🎯 Best Practices

✅ **DO:**
- Wrap all pages with ErrorBoundary
- Use apiClient for all fetch calls
- Set user context after login
- Provide user-friendly error messages
- Log errors with proper categories
- Use retry for transient failures

❌ **DON'T:**
- Use raw fetch() without retry
- Show technical errors to users
- Ignore error logging
- Retry non-retryable errors (auth, validation)
- Forget to clear user context on logout

## 🔗 Resources

- **Full Guide:** ERROR_HANDLING_GUIDE.md
- **Implementation Details:** ERROR_HANDLING_IMPLEMENTATION.md
- **Sentry Dashboard:** https://sentry.io
- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/

## 🆘 Troubleshooting

**Errors not appearing in Sentry?**
→ Check NEXT_PUBLIC_SENTRY_DSN is set
→ Verify NODE_ENV=production for production logging

**Retry not working?**
→ Check error is retryable (network/API errors)
→ Verify circuit breaker hasn't opened

**Build failing?**
→ Ensure SENTRY_AUTH_TOKEN is set for source maps
→ Check all imports are correct
