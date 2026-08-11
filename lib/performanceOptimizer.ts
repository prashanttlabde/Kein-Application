/**
 * Performance Optimizer for Keinshop
 * Implements advanced caching, query optimization, and data prefetching
 */

import { getSupabase } from './supabase';

// ============================================================================
// CACHE MANAGER
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Cache TTL configurations (in milliseconds)
  static readonly TTL = {
    PROFILES: 10 * 60 * 1000,      // 10 minutes
    REELS: 2 * 60 * 1000,          // 2 minutes
    LIVE_SESSIONS: 30 * 1000,      // 30 seconds
    PRODUCTS: 5 * 60 * 1000,       // 5 minutes
    CREATORS: 15 * 60 * 1000,      // 15 minutes
    STATS: 5 * 60 * 1000,          // 5 minutes
  };

  private generateKey(namespace: string, params: any): string {
    return `${namespace}:${JSON.stringify(params)}`;
  }

  get<T>(namespace: string, params: any = {}): T | null {
    const key = this.generateKey(namespace, params);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(namespace: string, params: any = {}, data: T, ttl: number): void {
    const key = this.generateKey(namespace, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // Deduplicate concurrent requests for the same data
  async deduplicate<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    // If there's already a pending request for this key, return it
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Create new request
    const promise = fetchFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  invalidate(namespace: string, params?: any): void {
    if (params) {
      const key = this.generateKey(namespace, params);
      this.cache.delete(key);
    } else {
      // Invalidate all entries in namespace
      const prefix = `${namespace}:`;
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

// ============================================================================
// PERFORMANCE OPTIMIZER
// ============================================================================

export class PerformanceOptimizer {
  private static cache = CacheManager.getInstance();

  /**
   * Fetch reels with aggressive caching and minimal data
   */
  static async getReelsOptimized(params: {
    page?: number;
    limit?: number;
    creatorId?: string;
  } = {}): Promise<{ data: any[] | null; error: any; hasMore: boolean }> {
    const { page = 0, limit = 10, creatorId } = params;

    // Check cache first
    const cacheKey = { page, limit, creatorId };
    const cached = this.cache.get<{ data: any[]; hasMore: boolean }>('reels', cacheKey);
    
    if (cached) {
      console.log('✅ Cache hit for reels');
      return { ...cached, error: null };
    }

    // Deduplicate concurrent requests
    const fetchKey = `reels:${JSON.stringify(cacheKey)}`;
    
    try {
      const result = await this.cache.deduplicate(fetchKey, async () => {
        const supabase = getSupabase();
        
        // Optimized query - only fetch essential fields
        let query = supabase
          .from('reels')
          .select(`
            id,
            title,
            video_url,
            thumbnail_url,
            view_count,
            like_count,
            created_at,
            creator_id,
            profiles!creator_id (
              id,
              full_name,
              username,
              avatar_url
            )
          `, { count: 'exact' })
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .range(page * limit, (page + 1) * limit);

        if (creatorId) {
          query = query.eq('creator_id', creatorId);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        const hasMore = count ? (page + 1) * limit < count : false;
        const result = { data: data || [], hasMore };

        // Cache the result
        this.cache.set('reels', cacheKey, result, CacheManager.TTL.REELS);

        return result;
      });

      return { ...result, error: null };
    } catch (error) {
      console.error('Error fetching reels:', error);
      return { data: null, error, hasMore: false };
    }
  }

  /**
   * Fetch live sessions with minimal latency
   */
  static async getLiveSessionsOptimized(params: {
    status?: 'live' | 'scheduled' | 'ended';
    limit?: number;
  } = {}): Promise<{ data: any[] | null; error: any }> {
    const { status = 'live', limit = 20 } = params;

    // Use shorter cache for live sessions (30 seconds)
    const cacheKey = { status, limit };
    const cached = this.cache.get<any[]>('live_sessions', cacheKey);
    
    if (cached) {
      console.log('✅ Cache hit for live sessions');
      return { data: cached, error: null };
    }

    const fetchKey = `live_sessions:${JSON.stringify(cacheKey)}`;

    try {
      const result = await this.cache.deduplicate(fetchKey, async () => {
        const supabase = getSupabase();

        // Optimized query with indexed fields (removed viewer_count - doesn't exist)
        const { data, error } = await supabase
          .from('live_stream_sessions')
          .select(`
            id,
            title,
            description,
            status,
            scheduled_start_time,
            actual_start_time,
            creator_id,
            profiles!creator_id (
              id,
              full_name,
              username,
              avatar_url,
              creator_verified
            )
          `)
          .eq('status', status)
          .order('actual_start_time', { ascending: false, nullsFirst: false })
          .limit(limit);

        if (error) throw error;

        // Cache with shorter TTL for live data
        this.cache.set('live_sessions', cacheKey, data || [], CacheManager.TTL.LIVE_SESSIONS);

        return data || [];
      });

      return { data: result, error: null };
    } catch (error) {
      console.error('Error fetching live sessions:', error);
      return { data: null, error };
    }
  }

  /**
   * Fetch user profile with caching
   */
  static async getUserProfileOptimized(userId: string): Promise<{ data: any | null; error: any }> {
    // Check cache
    const cached = this.cache.get<any>('profiles', { userId });
    
    if (cached) {
      console.log('✅ Cache hit for profile:', userId);
      return { data: cached, error: null };
    }

    const fetchKey = `profile:${userId}`;

    try {
      const result = await this.cache.deduplicate(fetchKey, async () => {
        const supabase = getSupabase();

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        // Cache the profile
        this.cache.set('profiles', { userId }, data, CacheManager.TTL.PROFILES);

        return data;
      });

      return { data: result, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Batch fetch multiple profiles efficiently
   */
  static async batchFetchProfiles(userIds: string[]): Promise<{ data: any[] | null; error: any }> {
    if (!userIds || userIds.length === 0) {
      return { data: [], error: null };
    }

    const uniqueIds = [...new Set(userIds)];
    const cacheKey = { userIds: uniqueIds.sort() };
    
    const cached = this.cache.get<any[]>('batch_profiles', cacheKey);
    if (cached) {
      console.log('✅ Cache hit for batch profiles');
      return { data: cached, error: null };
    }

    try {
      const supabase = getSupabase();
      
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
        .in('id', uniqueIds);

      if (error) throw error;

      // Cache individual profiles
      data?.forEach((profile: any) => {
        this.cache.set('profiles', { userId: profile.id }, profile, CacheManager.TTL.PROFILES);
      });

      // Cache the batch
      this.cache.set('batch_profiles', cacheKey, data || [], CacheManager.TTL.PROFILES);

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error batch fetching profiles:', error);
      return { data: null, error };
    }
  }

  /**
   * Fetch featured creators with caching
   */
  static async getFeaturedCreatorsOptimized(limit = 8): Promise<{ data: any[] | null; error: any }> {
    const cacheKey = { limit };
    const cached = this.cache.get<any[]>('featured_creators', cacheKey);
    
    if (cached) {
      console.log('✅ Cache hit for featured creators');
      return { data: cached, error: null };
    }

    try {
      const supabase = getSupabase();
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          is_creator,
          creator_verified,
          followers_count,
          bio
        `)
        .eq('is_creator', true)
        .eq('creator_verified', true)
        .order('followers_count', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw error;

      this.cache.set('featured_creators', cacheKey, data || [], CacheManager.TTL.CREATORS);

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching featured creators:', error);
      return { data: null, error };
    }
  }

  /**
   * Prefetch home page data in parallel
   */
  static async prefetchHomePageData(): Promise<{
    reels: any[] | null;
    liveSessions: any[] | null;
    creators: any[] | null;
    errors: any[];
  }> {
    console.log('🚀 Prefetching home page data...');
    const startTime = performance.now();

    const [reelsResult, liveResult, creatorsResult] = await Promise.allSettled([
      this.getReelsOptimized({ limit: 8 }),
      this.getLiveSessionsOptimized({ limit: 10 }),
      this.getFeaturedCreatorsOptimized(8),
    ]);

    const endTime = performance.now();
    console.log(`✅ Home page data prefetched in ${(endTime - startTime).toFixed(2)}ms`);

    return {
      reels: reelsResult.status === 'fulfilled' ? reelsResult.value.data : null,
      liveSessions: liveResult.status === 'fulfilled' ? liveResult.value.data : null,
      creators: creatorsResult.status === 'fulfilled' ? creatorsResult.value.data : null,
      errors: [
        reelsResult.status === 'rejected' ? reelsResult.reason : null,
        liveResult.status === 'rejected' ? liveResult.reason : null,
        creatorsResult.status === 'rejected' ? creatorsResult.reason : null,
      ].filter(Boolean),
    };
  }

  /**
   * Invalidate cache for specific data types
   */
  static invalidateCache(type: 'reels' | 'profiles' | 'live_sessions' | 'creators' | 'all', params?: any) {
    if (type === 'all') {
      this.cache.clear();
      console.log('🗑️ All cache cleared');
    } else {
      this.cache.invalidate(type, params);
      console.log(`🗑️ Cache invalidated for: ${type}`);
    }
  }
}

// Export cache manager for external use
export { CacheManager };
