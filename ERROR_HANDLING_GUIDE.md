# Error Handling & Monitoring Setup

This document explains the comprehensive error handling and monitoring system implemented in the application.

## Overview

The error handling system consists of:

1. **Sentry Integration** - Production error tracking and monitoring
2. **Error Boundaries** - React error boundaries for graceful UI error handling
3. **Retry Logic** - Automatic retry with exponential backoff for API calls
4. **User-Friendly Messages** - Context-aware error messages for better UX
5. **Circuit Breaker Pattern** - Prevents cascading failures

## Setup

### 1. Sentry Configuration

Add your Sentry DSN to `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

Get your DSN from [Sentry.io](https://sentry.io):
1. Create a new project or use existing one
2. Go to Settings > Projects > [Your Project] > Client Keys (DSN)
3. Copy the DSN and add it to your environment variables

### 2. Environment Variables

Create or update `.env.local`:

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# Environment
NODE_ENV=development # or production
```

## Usage

### Error Boundaries

Wrap components with error boundaries for graceful error handling:

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

function MyPage() {
  return (
    <ErrorBoundary context="MyPage">
      <MyComponent />
    </ErrorBoundary>
  );
}
```

For authentication-specific errors:

```tsx
import ErrorBoundary, { AuthErrorFallback } from '@/components/ErrorBoundary';

function AuthPage() {
  return (
    <ErrorBoundary fallback={AuthErrorFallback} context="AuthPage">
      <AuthComponent />
    </ErrorBoundary>
  );
}
```

### API Calls with Retry

Use the enhanced API client for all external API calls:

```tsx
import { get, post, put, del } from '@/lib/apiClient';

// GET request
const data = await get('/api/users', {
  retry: { maxRetries: 3 },
  context: { action: 'fetch users' }
});

// POST request
const result = await post('/api/users', { name: 'John' }, {
  retry: { maxRetries: 2 },
  context: { action: 'create user' }
});

// Custom retry options
const response = await get('/api/critical-data', {
  retry: {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 30000,
    shouldRetry: (error, attempt) => {
      // Custom retry logic
      return attempt < 3;
    }
  }
});
```

### Supabase Queries with Retry

Wrap Supabase queries for automatic retry:

```tsx
import { supabaseQuery } from '@/lib/apiClient';
import { supabase } from '@/lib/supabase';

const users = await supabaseQuery(
  () => supabase.from('users').select('*'),
  {
    retry: { maxRetries: 2 },
    context: { action: 'fetch users' },
    errorMessage: 'Failed to load users. Please try again.'
  }
);
```

### Error Tracking

Track custom errors and events:

```tsx
import { 
  logError, 
  createAppError, 
  ErrorCategory, 
  ErrorSeverity,
  setUserContext,
  addBreadcrumb,
  captureMessage
} from '@/lib/errorTracking';

// Set user context (call after authentication)
setUserContext({
  id: user.id,
  email: user.email,
  username: user.username
});

// Add breadcrumbs for debugging
addBreadcrumb('User action', 'user', { action: 'clicked button' });

// Create and log structured errors
const error = createAppError('Payment failed', {
  category: ErrorCategory.PAYMENT,
  severity: ErrorSeverity.HIGH,
  context: {
    userId: user.id,
    action: 'process payment',
    metadata: { amount: 100 }
  },
  userMessage: 'Payment processing failed. Please try again.',
  retryable: true
});
logError(error);

// Capture custom messages
captureMessage('User completed checkout', 'info', { userId: user.id });
```

### Circuit Breaker

The circuit breaker automatically prevents cascading failures:

```tsx
import { apiCircuitBreaker, databaseCircuitBreaker } from '@/lib/apiRetry';

// API calls automatically use the circuit breaker
// Check circuit breaker state
const state = apiCircuitBreaker.getState();
console.log(state); // { state: 'closed', failures: 0, lastFailureTime: 0 }

// Reset circuit breaker manually if needed
apiCircuitBreaker.reset();
```

## Error Categories

The system supports these error categories:

- `AUTH` - Authentication and authorization errors
- `API` - External API call failures
- `DATABASE` - Database query errors
- `PAYMENT` - Payment processing failures
- `NETWORK` - Network connectivity issues
- `VALIDATION` - Input validation errors
- `UNKNOWN` - Uncategorized errors

## Error Severity Levels

- `LOW` - Minor issues, informational (maps to Sentry 'info')
- `MEDIUM` - Expected errors, warnings (maps to Sentry 'warning')
- `HIGH` - Unexpected errors requiring attention (maps to Sentry 'error')
- `CRITICAL` - Critical failures affecting system (maps to Sentry 'fatal')

## Best Practices

### 1. Always Use Error Boundaries

Wrap route-level components with error boundaries:

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <ErrorBoundary context="DashboardPage">
      <DashboardContent />
    </ErrorBoundary>
  );
}
```

### 2. Use API Client for External Calls

Replace direct `fetch` calls:

```tsx
// ❌ Don't do this
const response = await fetch('/api/data');
const data = await response.json();

// ✅ Do this instead
import { get } from '@/lib/apiClient';
const data = await get('/api/data', {
  context: { action: 'fetch data' }
});
```

### 3. Set User Context Early

Set user context after authentication:

```tsx
// After successful login
import { setUserContext } from '@/lib/errorTracking';

setUserContext({
  id: user.id,
  email: user.email,
  username: user.username
});
```

### 4. Add Breadcrumbs for User Actions

Track important user actions:

```tsx
import { addBreadcrumb } from '@/lib/errorTracking';

function handleCheckout() {
  addBreadcrumb('Checkout initiated', 'user', { 
    cartTotal: total,
    itemCount: items.length 
  });
  // ... checkout logic
}
```

### 5. Provide User-Friendly Messages

Always provide context-appropriate error messages:

```tsx
const error = createAppError('API timeout', {
  category: ErrorCategory.API,
  severity: ErrorSeverity.MEDIUM,
  userMessage: 'The request took too long. Please try again.',
  retryable: true
});
```

## Monitoring Dashboard

Access your Sentry dashboard to:

1. View error trends and patterns
2. Get real-time alerts for critical errors
3. See error stack traces and context
4. Track error resolution status
5. Monitor application performance

## Testing

Test error boundaries in development:

```tsx
// Create a test component that throws
function ErrorTest() {
  throw new Error('Test error');
}

// Wrap with error boundary
<ErrorBoundary>
  <ErrorTest />
</ErrorBoundary>
```

## Troubleshooting

### Sentry Not Logging Errors

1. Check `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. Verify `NODE_ENV=production` for production logging
3. Check Sentry project settings and DSN validity

### Errors Not Retrying

1. Verify error is retryable (network/API errors)
2. Check retry options configuration
3. Review circuit breaker state

### Error Messages Not User-Friendly

1. Ensure `userMessage` is provided in `createAppError`
2. Check error category is set correctly
3. Use `getUserFriendlyErrorMessage` utility

## Files Reference

- `sentry.client.config.ts` - Client-side Sentry configuration
- `sentry.server.config.ts` - Server-side Sentry configuration
- `sentry.edge.config.ts` - Edge runtime Sentry configuration
- `lib/errorTracking.ts` - Error tracking utilities and types
- `lib/apiRetry.ts` - Retry logic and circuit breaker
- `lib/apiClient.ts` - Enhanced API client with retry
- `components/ErrorBoundary.tsx` - React error boundaries
- `app/error.tsx` - Page-level error boundary
- `app/global-error.tsx` - Root-level error boundary

## Next Steps

1. Set up Sentry project and configure DSN
2. Add error boundaries to all route components
3. Replace direct fetch calls with API client
4. Set user context after authentication
5. Monitor errors in Sentry dashboard
6. Configure alerting rules for critical errors
