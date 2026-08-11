import { DatabaseOptimizer } from './databaseOptimizer';
import { OptimizedDatabase } from './optimizedDatabase';

// Data preloading service for faster initial page loads
export class DataPreloader {
  private static preloadedData: Map<string, any> = new Map();
  private static preloadPromises: Map<string, Promise<any>> = new Map();

  // Preload critical home page data
  static async preloadHomePageData(): Promise<{
    homeData: any;
    userProfiles: any;
    preloadTime: number;
  } | null> {
    const preloadKey = 'homePageData';
    
    // Check if already preloading or preloaded
    if (this.preloadPromises.has(preloadKey)) {
      return this.preloadPromises.get(preloadKey);
    }

    const preloadPromise = this.performHomePagePreload();
    this.preloadPromises.set(preloadKey, preloadPromise);

    try {
      const data = await preloadPromise;
      this.preloadedData.set(preloadKey, data);
      return data;
    } catch (error) {
      console.error('DataPreloader: Error preloading home page data:', error);
      this.preloadPromises.delete(preloadKey);
      return null;
    }
  }

  private static async performHomePagePreload() {
    const startTime = performance.now();
    
    try {
      // Preload all critical data in parallel
      const [homeData, userProfiles] = await Promise.allSettled([
        DatabaseOptimizer.preloadHomePageData(),
        this.preloadUserProfiles()
      ]);

      const endTime = performance.now();
      console.log(`🚀 Home page data preloaded in ${endTime - startTime}ms`);

      return {
        homeData: homeData.status === 'fulfilled' ? homeData.value : null,
        userProfiles: userProfiles.status === 'fulfilled' ? userProfiles.value : null,
        preloadTime: endTime - startTime
      };
    } catch (error) {
      console.error('DataPreloader: Error in performHomePagePreload:', error);
      throw error;
    }
  }

  // Preload user profiles for creators section
  private static async preloadUserProfiles() {
    try {
      const { data, error } = await DatabaseOptimizer.getCreatorsOptimized(8);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Preload authentication data
  static async preloadAuthData(userId: string): Promise<void> {
    const preloadKey = `authData_${userId}`;
    
    if (this.preloadPromises.has(preloadKey)) {
      return this.preloadPromises.get(preloadKey);
    }

    const preloadPromise = OptimizedDatabase.preloadCriticalData(userId);
    this.preloadPromises.set(preloadKey, preloadPromise);

    try {
      await preloadPromise;
    } catch (error) {
      console.error('DataPreloader: Error preloading auth data:', error);
      this.preloadPromises.delete(preloadKey);
    }
  }

  // Get preloaded data
  static getPreloadedData<T>(key: string): T | null {
    return this.preloadedData.get(key) || null;
  }

  // Clear preloaded data
  static clearPreloadedData(pattern?: string): void {
    if (!pattern) {
      this.preloadedData.clear();
      this.preloadPromises.clear();
      return;
    }

    for (const key of this.preloadedData.keys()) {
      if (key.includes(pattern)) {
        this.preloadedData.delete(key);
      }
    }

    for (const key of this.preloadPromises.keys()) {
      if (key.includes(pattern)) {
        this.preloadPromises.delete(key);
      }
    }
  }

  // Preload data for specific routes
  static async preloadRouteData(route: string): Promise<void> {
    switch (route) {
      case '/':
        await this.preloadHomePageData();
        break;
      case '/products':
        await this.preloadProductsData();
        break;
      case '/reels':
        await this.preloadReelsData();
        break;
      default:
        // No specific preloading for this route
        break;
    }
  }

  private static async preloadProductsData(): Promise<void> {
    try {
      const { data, error, hasMore } = await DatabaseOptimizer.getProductsOptimized(0, 24);
      this.preloadedData.set('productsData', { data, error, hasMore });
    } catch (error) {
      console.error('DataPreloader: Error preloading products data:', error);
    }
  }

  private static async preloadReelsData(): Promise<void> {
    try {
      const { data, error, hasMore } = await DatabaseOptimizer.getReelsOptimized(0, 12);
      this.preloadedData.set('reelsData', { data, error, hasMore });
    } catch (error) {
      console.error('DataPreloader: Error preloading reels data:', error);
    }
  }

  // Initialize preloading on app start
  static initialize(): void {
    // Start preloading critical data immediately
    this.preloadHomePageData().catch(console.error);
    
    // Preload additional data after a short delay
    setTimeout(() => {
      this.preloadProductsData().catch(console.error);
    }, 1000);
  }
}

