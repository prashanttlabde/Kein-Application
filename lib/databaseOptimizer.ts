import { getSupabase } from './supabase';

// Database query optimizer with connection pooling and batching
export class DatabaseOptimizer {
  private static queryQueue: Array<() => Promise<any>> = [];
  private static isProcessing = false;
  private static connectionPool: Map<string, any> = new Map();

  // Batch multiple queries together
  static async batchQueries<T>(
    queries: Array<() => Promise<T>>,
    maxConcurrency = 5
  ): Promise<T[]> {
    const results: T[] = [];
    const errors: Error[] = [];

    // Process queries in batches
    for (let i = 0; i < queries.length; i += maxConcurrency) {
      const batch = queries.slice(i, i + maxConcurrency);
      const batchPromises = batch.map(async (query, index) => {
        try {
          const result = await query();
          return { index: i + index, result, error: null };
        } catch (error) {
          return { index: i + index, result: null, error: error as Error };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { index, result: data, error } = result.value;
          if (error) {
            errors[index] = error;
          } else {
            results[index] = data;
          }
        } else {
          errors.push(result.reason);
        }
      });
    }

    if (errors.length > 0) {
      console.warn('Some queries failed:', errors);
    }

    return results;
  }

  // Optimized creators query with minimal data
  static async getCreatorsOptimized(limit = 8): Promise<{
    data: any[] | null;
    error: any;
  }> {
    try {
      const supabase = getSupabase();
      
      // Use optimized query with only essential fields
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          is_creator,
          creator_verified,
          followers_count
        `)
        .eq('is_creator', true)
        .eq('creator_verified', true)
        .order('followers_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('DatabaseOptimizer: Creators query error:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('DatabaseOptimizer: Exception in getCreatorsOptimized:', error);
      return { data: null, error };
    }
  }

  // Optimized products query with pagination
  static async getProductsOptimized(
    page = 0,
    limit = 12,
    category?: string
  ): Promise<{
    data: any[] | null;
    error: any;
    hasMore: boolean;
  }> {
    try {
      const supabase = getSupabase();
      
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image_url,
          category,
          seller_id,
          profiles:seller_id (
            full_name,
            username
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit + 1); // Get one extra to check if there are more

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('DatabaseOptimizer: Products query error:', error);
        return { data: null, error, hasMore: false };
      }

      if (data) {
        const hasMore = data.length > limit;
        const actualData = hasMore ? data.slice(0, limit) : data;
        
        return { data: actualData, error: null, hasMore };
      }

      return { data: [], error: null, hasMore: false };
    } catch (error) {
      console.error('DatabaseOptimizer: Exception in getProductsOptimized:', error);
      return { data: null, error, hasMore: false };
    }
  }

  // Preload critical data for faster initial load
  static async preloadHomePageData(): Promise<{
    creators: any[] | null;
    products: any[] | null;
    reels: any[] | null;
    error: any;
  }> {
    try {
      const startTime = performance.now();
      
      // Batch all home page queries
      const [creatorsResult, productsResult, reelsResult] = await this.batchQueries([
        () => this.getCreatorsOptimized(8),
        () => this.getProductsOptimized(0, 12),
        () => this.getReelsOptimized(0, 8)
      ]);

      const endTime = performance.now();
      console.log(`🚀 Home page data preloaded in ${endTime - startTime}ms`);

      return {
        creators: creatorsResult?.data || null,
        products: productsResult?.data || null,
        reels: reelsResult?.data || null,
        error: creatorsResult?.error || productsResult?.error || reelsResult?.error || null
      };
    } catch (error) {
      console.error('DatabaseOptimizer: Error preloading home page data:', error);
      return {
        creators: null,
        products: null,
        reels: null,
        error
      };
    }
  }

  // Optimized reels query
  static async getReelsOptimized(
    page = 0,
    limit = 8
  ): Promise<{
    data: any[] | null;
    error: any;
    hasMore: boolean;
  }> {
    try {
      const supabase = getSupabase();
      
      const { data, error } = await supabase
        .from('reels')
        .select(`
          id,
          title,
          video_url,
          view_count,
          like_count,
          created_at,
          creator_id,
          profiles:creator_id (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit + 1);

      if (error) {
        console.error('DatabaseOptimizer: Reels query error:', error);
        return { data: null, error, hasMore: false };
      }

      if (data) {
        const hasMore = data.length > limit;
        const actualData = hasMore ? data.slice(0, limit) : data;
        
        return { data: actualData, error: null, hasMore };
      }

      return { data: [], error: null, hasMore: false };
    } catch (error) {
      console.error('DatabaseOptimizer: Exception in getReelsOptimized:', error);
      return { data: null, error, hasMore: false };
    }
  }

  // Connection pooling for better performance
  static getConnection(key: string) {
    if (!this.connectionPool.has(key)) {
      this.connectionPool.set(key, getSupabase());
    }
    return this.connectionPool.get(key);
  }

  // Clear connection pool
  static clearConnections() {
    this.connectionPool.clear();
  }
}

