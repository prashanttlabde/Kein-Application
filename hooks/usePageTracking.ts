'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/**
 * Hook to automatically track page views in GA4
 * Place this in your root layout or main component
 */
export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only track in production or if GA is configured
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      return;
    }

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Small delay to ensure GA is loaded
    const timeoutId = setTimeout(() => {
      trackPageView(url);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams]);
}
