import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment configuration
  environment: process.env.NODE_ENV,

  // Ignore common errors
  ignoreErrors: [
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],

  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Event (dev):', event);
      return null;
    }

    // Add custom context
    if (event.request) {
      event.request.headers = {
        ...event.request.headers,
        // Remove sensitive headers
        'cookie': '[Filtered]',
        'authorization': '[Filtered]',
      };
    }

    return event;
  },
});
