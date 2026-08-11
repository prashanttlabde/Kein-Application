import { ComponentType, ReactElement } from 'react';
import dynamic from 'next/dynamic';

// Higher-order component for dynamic imports with loading states
export const createDynamicComponent = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  loadingComponent?: () => ReactElement<any>
) => {
  return dynamic(importFunc, {
    loading: loadingComponent,
    ssr: false, // Disable SSR for better performance on client-side components
  });
};

// Pre-configured dynamic imports for common components
export const DynamicBannerCarousel = createDynamicComponent(
  () => import('../components/BannerCarousel'),
  () => (
    <div className="banner-loading">
      <div className="banner-loading-spinner"></div>
      <p>Loading banners...</p>
    </div>
  )
);

export const DynamicFeaturedReels = createDynamicComponent(
  () => import('../components/FeaturedReels'),
  () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
);

export const DynamicMobileNavigation = createDynamicComponent(
  () => import('../components/MobileNavigation')
);

// Utility for lazy loading heavy components
export const lazyLoadComponent = <P extends object>(
  component: ComponentType<P>,
  delay: number = 0
) => {
  return createDynamicComponent<P>(
    () => new Promise<{ default: ComponentType<P> }>(resolve => {
      setTimeout(() => {
        resolve({ default: component });
      }, delay);
    })
  );
};

