/**
 * Responsive Design Utilities
 * 
 * Helper functions for testing and debugging responsive behavior
 */

/**
 * Breakpoints matching Tailwind CSS defaults
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(): Breakpoint | 'xs' {
  if (typeof window === 'undefined') return 'xs';
  
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Check if viewport is mobile (< md breakpoint)
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
}

/**
 * Check if viewport is tablet (md to lg)
 */
export function isTabletViewport(): boolean {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
}

/**
 * Check if viewport is desktop (>= lg)
 */
export function isDesktopViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
}

/**
 * Check for horizontal overflow
 * Useful for debugging scrolling issues
 */
export function checkHorizontalOverflow(): {
  hasOverflow: boolean;
  overflowingElements: HTMLElement[];
} {
  if (typeof window === 'undefined') {
    return { hasOverflow: false, overflowingElements: [] };
  }

  const documentWidth = document.documentElement.clientWidth;
  const overflowingElements: HTMLElement[] = [];

  // Check all elements for overflow
  const allElements = document.getElementsByTagName('*');
  
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i] as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    if (rect.right > documentWidth || rect.left < 0) {
      overflowingElements.push(element);
    }
  }

  return {
    hasOverflow: overflowingElements.length > 0,
    overflowingElements,
  };
}

/**
 * Check if element or its parent is an intentional scroll container
 */
function isInScrollContainer(element: Element): boolean {
  let current: Element | null = element;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    if (style.overflowX === 'auto' || style.overflowX === 'scroll' || style.overflowX === 'hidden') {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

/**
 * Log overflowing elements to console (excludes intentional scroll containers)
 */
export function debugHorizontalOverflow(): void {
  const { hasOverflow, overflowingElements } = checkHorizontalOverflow();
  
  // Filter out elements inside scroll containers
  const problematicElements = overflowingElements.filter(el => !isInScrollContainer(el));
  
  if (problematicElements.length === 0) {
    console.log('✅ No problematic horizontal overflow detected');
    if (overflowingElements.length > 0) {
      console.log(`ℹ️ ${overflowingElements.length} elements overflow but are inside scroll containers (expected)`);
    }
    return;
  }

  console.warn(`⚠️ Found ${problematicElements.length} elements causing unexpected horizontal overflow:`);
  
  problematicElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    // Get className as string - handles both HTML and SVG elements
    const className = typeof element.className === 'string' 
      ? element.className 
      : (element.className && 'baseVal' in element.className ? (element.className as SVGAnimatedString).baseVal : '');
    
    console.group(`${index + 1}. ${element.tagName.toLowerCase()}${className ? '.' + className.split(' ').join('.') : ''}`);
    console.log('Element:', element);
    console.log('Bounding rect:', {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      overflow: rect.right - document.documentElement.clientWidth,
    });
    console.log('Computed width:', computedStyle.width);
    console.log('Computed max-width:', computedStyle.maxWidth);
    console.groupEnd();
  });
}

/**
 * Check if touch targets meet minimum size requirements (44x44px)
 */
export function checkTouchTargets(): {
  valid: boolean;
  invalidElements: Array<{
    element: HTMLElement;
    width: number;
    height: number;
  }>;
} {
  if (typeof window === 'undefined') {
    return { valid: true, invalidElements: [] };
  }

  const MIN_SIZE = 44;
  const invalidElements: Array<{
    element: HTMLElement;
    width: number;
    height: number;
  }> = [];

  // Check interactive elements
  const interactiveSelectors = [
    'button',
    'a',
    'input[type="button"]',
    'input[type="submit"]',
    '[role="button"]',
    '[onclick]',
  ];

  interactiveSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      
      if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
        invalidElements.push({
          element: element as HTMLElement,
          width: rect.width,
          height: rect.height,
        });
      }
    });
  });

  return {
    valid: invalidElements.length === 0,
    invalidElements,
  };
}

/**
 * Log invalid touch targets to console
 */
export function debugTouchTargets(): void {
  const { valid, invalidElements } = checkTouchTargets();
  
  if (valid) {
    console.log('✅ All touch targets meet minimum size requirements (44x44px)');
    return;
  }

  console.warn(`⚠️ Found ${invalidElements.length} touch targets below 44x44px:`);
  
  invalidElements.forEach(({ element, width, height }, index) => {
    console.group(`${index + 1}. ${element.tagName.toLowerCase()}${element.className ? '.' + element.className.split(' ').join('.') : ''}`);
    console.log('Element:', element);
    console.log('Size:', `${Math.round(width)}x${Math.round(height)}px`);
    console.log('Missing:', {
      width: width < 44 ? `${44 - Math.round(width)}px` : 'OK',
      height: height < 44 ? `${44 - Math.round(height)}px` : 'OK',
    });
    console.groupEnd();
  });
}

/**
 * Get device orientation
 */
export function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait';
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * Detect if device is touch-enabled
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get safe area insets (for notch, home indicator, etc.)
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
  };
}

/**
 * Run all responsive diagnostics
 */
export function runResponsiveDiagnostics(): void {
  console.group('📱 Responsive Design Diagnostics');
  
  console.log('Device Info:', {
    breakpoint: getCurrentBreakpoint(),
    viewport: `${window.innerWidth}x${window.innerHeight}px`,
    orientation: getOrientation(),
    isMobile: isMobileViewport(),
    isTablet: isTabletViewport(),
    isDesktop: isDesktopViewport(),
    isTouchDevice: isTouchDevice(),
    safeAreaInsets: getSafeAreaInsets(),
  });
  
  console.log('\n--- Horizontal Overflow Check ---');
  debugHorizontalOverflow();
  
  console.log('\n--- Touch Target Check ---');
  debugTouchTargets();
  
  console.groupEnd();
}

// Make available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).responsiveDebug = {
    checkOverflow: debugHorizontalOverflow,
    checkTouchTargets: debugTouchTargets,
    runDiagnostics: runResponsiveDiagnostics,
    getCurrentBreakpoint,
    isMobile: isMobileViewport,
    isTablet: isTabletViewport,
    isDesktop: isDesktopViewport,
  };
  
  console.log('💡 Responsive debugging tools available via window.responsiveDebug');
}
