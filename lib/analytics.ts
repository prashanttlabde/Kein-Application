/**
 * Google Analytics 4 Utility Functions
 * 
 * Use these functions to track custom events throughout your application
 */

// Type definitions for GA4 events
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Check if Google Analytics is loaded
 */
export const isGALoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Track page view
 * This is automatically handled by GA4, but you can manually trigger it for SPAs
 */
export const trackPageView = (url: string, title?: string) => {
  if (!isGALoaded()) return;

  window.gtag!('event', 'page_view', {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  });
};

/**
 * Track custom events
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (!isGALoaded()) return;

  window.gtag!('event', eventName, eventParams);
};

/**
 * E-commerce Events
 */

// Track product view
export const trackProductView = (product: {
  id: string;
  name: string;
  category?: string;
  price?: number;
  brand?: string;
}) => {
  trackEvent('view_item', {
    currency: 'INR',
    value: product.price || 0,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        item_brand: product.brand,
        price: product.price,
      },
    ],
  });
};

// Track add to cart
export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
}) => {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: product.price * (product.quantity || 1),
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: product.quantity || 1,
      },
    ],
  });
};

// Track purchase
export const trackPurchase = (
  transactionId: string,
  value: number,
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>
) => {
  trackEvent('purchase', {
    transaction_id: transactionId,
    currency: 'INR',
    value: value,
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

// Track begin checkout
export const trackBeginCheckout = (value: number, items: any[]) => {
  trackEvent('begin_checkout', {
    currency: 'INR',
    value: value,
    items: items,
  });
};

/**
 * Social & Engagement Events
 */

// Track creator follow
export const trackCreatorFollow = (creatorId: string, creatorName: string) => {
  trackEvent('creator_follow', {
    creator_id: creatorId,
    creator_name: creatorName,
  });
};

// Track live stream join
export const trackLiveStreamJoin = (
  streamId: string,
  creatorName: string,
  viewerCount?: number
) => {
  trackEvent('live_stream_join', {
    stream_id: streamId,
    creator_name: creatorName,
    viewer_count: viewerCount,
  });
};

// Track reel view
export const trackReelView = (
  reelId: string,
  creatorName: string,
  category?: string
) => {
  trackEvent('reel_view', {
    reel_id: reelId,
    creator_name: creatorName,
    content_category: category,
  });
};

// Track search
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

// Track share
export const trackShare = (
  contentType: 'product' | 'reel' | 'creator' | 'live',
  contentId: string,
  method?: 'facebook' | 'twitter' | 'whatsapp' | 'copy_link'
) => {
  trackEvent('share', {
    content_type: contentType,
    content_id: contentId,
    method: method,
  });
};

// Track sign up
export const trackSignUp = (method: 'google' | 'email' | 'phone') => {
  trackEvent('sign_up', {
    method: method,
  });
};

// Track login
export const trackLogin = (method: 'google' | 'email' | 'phone') => {
  trackEvent('login', {
    method: method,
  });
};

/**
 * User Engagement
 */

// Track video play
export const trackVideoPlay = (
  videoId: string,
  videoTitle: string,
  duration?: number
) => {
  trackEvent('video_start', {
    video_id: videoId,
    video_title: videoTitle,
    video_duration: duration,
  });
};

// Track video complete
export const trackVideoComplete = (videoId: string, videoTitle: string) => {
  trackEvent('video_complete', {
    video_id: videoId,
    video_title: videoTitle,
  });
};

// Track scroll depth
export const trackScrollDepth = (percentage: number, page: string) => {
  trackEvent('scroll_depth', {
    scroll_percentage: percentage,
    page_path: page,
  });
};

/**
 * Conversion Events
 */

// Track form submission
export const trackFormSubmission = (
  formName: string,
  formId?: string,
  success?: boolean
) => {
  trackEvent('form_submit', {
    form_name: formName,
    form_id: formId,
    success: success,
  });
};

// Track newsletter signup
export const trackNewsletterSignup = (location: string) => {
  trackEvent('newsletter_signup', {
    signup_location: location,
  });
};

// Track error
export const trackError = (
  errorMessage: string,
  errorType: string,
  fatal?: boolean
) => {
  trackEvent('exception', {
    description: errorMessage,
    error_type: errorType,
    fatal: fatal || false,
  });
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (!isGALoaded()) return;

  window.gtag!('set', 'user_properties', properties);
};

/**
 * Set user ID for cross-device tracking
 */
export const setUserId = (userId: string) => {
  if (!isGALoaded()) return;

  window.gtag!('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
    user_id: userId
  });
};
