import { getSupabase, getSupabaseAdmin } from './supabase'
import { UserProfile } from './database'

// Optimized database operations with caching and batching
export class OptimizedDatabase {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  // Cache TTL in milliseconds
  private static readonly CACHE_TTL = {
    profiles: 5 * 60 * 1000, // 5 minutes
    products: 10 * 60 * 1000, // 10 minutes
    reels: 2 * 60 * 1000, // 2 minutes
    stats: 30 * 60 * 1000, // 30 minutes
  }

  private static getCacheKey(operation: string, params: any): string {
    return `${operation}:${JSON.stringify(params)}`
  }

  private static getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data as T
  }

  private static setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // Optimized profile fetching with caching
  static async getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    const cacheKey = this.getCacheKey('profile', { userId })
    const cached = this.getFromCache<UserProfile>(cacheKey)
    
    if (cached) {
      return { data: cached, error: null }
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data && !error) {
      this.setCache(cacheKey, data, this.CACHE_TTL.profiles)
    }

    return { data, error }
  }

  // Batch fetch multiple profiles
  static async getBatchProfiles(userIds: string[]): Promise<{ data: UserProfile[] | null; error: any }> {
    const cacheKey = this.getCacheKey('batchProfiles', { userIds: userIds.sort() })
    const cached = this.getFromCache<UserProfile[]>(cacheKey)
    
    if (cached) {
      return { data: cached, error: null }
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)

    if (data && !error) {
      // Cache individual profiles too
      data.forEach((profile: UserProfile) => {
        const profileKey = this.getCacheKey('profile', { userId: profile.id })
        this.setCache(profileKey, profile, this.CACHE_TTL.profiles)
      })
      
      this.setCache(cacheKey, data, this.CACHE_TTL.profiles)
    }

    return { data, error }
  }

  // Optimized reels with pagination and minimal data
  static async getReelsPaginated(
    page = 0, 
    limit = 10, 
    creatorId?: string
  ): Promise<{ data: any[] | null; error: any; hasMore: boolean }> {
    const cacheKey = this.getCacheKey('reelsPaginated', { page, limit, creatorId })
    const cached = this.getFromCache<{ data: any[]; hasMore: boolean }>(cacheKey)
    
    if (cached) {
      return { ...cached, error: null }
    }

    try {
      // Use optimized query that leverages our new indexes
      const supabase = getSupabase();
      let query = supabase
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
        .limit(limit + 1) // Get one extra to check if there are more

      if (creatorId) {
        query = query.eq('creator_id', creatorId)
      }

      const { data, error } = await query

      if (error) {
        console.error('OptimizedDatabase: Reels query error:', error)
        return { data: null, error, hasMore: false }
      }

      if (data) {
        const hasMore = data.length > limit
        const actualData = hasMore ? data.slice(0, limit) : data
        
        const result = { data: actualData, hasMore }
        this.setCache(cacheKey, result, this.CACHE_TTL.reels)
        
        return { ...result, error: null }
      }

      return { data: [], error: null, hasMore: false }
    } catch (error) {
      console.error('OptimizedDatabase: Exception in getReelsPaginated:', error)
      return { data: null, error, hasMore: false }
    }
  }

  // Optimized dashboard stats with heavy caching
  static async getDashboardStats(userId: string, role: 'creator' | 'seller'): Promise<{ data: any | null; error: any }> {
    const cacheKey = this.getCacheKey('dashboardStats', { userId, role })
    const cached = this.getFromCache<any>(cacheKey)
    
    if (cached) {
      return { data: cached, error: null }
    }

    try {
      const supabase = getSupabase();
      let stats = {}

      if (role === 'creator') {
        // Batch all creator stats in parallel
        const [reelsResult, viewsResult, earningsResult] = await Promise.all([
          supabase.from('reels').select('id').eq('creator_id', userId).eq('is_active', true),
          supabase.from('reels').select('view_count').eq('creator_id', userId),
          supabase.from('contracts').select('total_commission').eq('creator_id', userId).eq('status', 'active')
        ])

        stats = {
          totalReels: reelsResult.data?.length || 0,
          totalViews: viewsResult.data?.reduce((sum: number, reel: any) => sum + (reel.view_count || 0), 0) || 0,
          totalEarnings: earningsResult.data?.reduce((sum: number, contract: any) => sum + (contract.total_commission || 0), 0) || 0,
          totalFollowers: 89000, // Mock for now
        }
      } else {
        // Batch all seller stats in parallel
        const [productsResult, ordersResult, revenueResult] = await Promise.all([
          supabase.from('products').select('id').eq('seller_id', userId).eq('is_active', true),
          supabase.from('orders').select('id, total_amount').eq('seller_id', userId),
          supabase.from('orders').select('total_amount').eq('seller_id', userId).eq('status', 'completed')
        ])

        stats = {
          totalProducts: productsResult.data?.length || 0,
          totalOrders: ordersResult.data?.length || 0,
          totalRevenue: revenueResult.data?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0,
          pendingOrders: ordersResult.data?.filter((o: any) => o.status === 'pending').length || 0,
        }
      }

      this.setCache(cacheKey, stats, this.CACHE_TTL.stats)
      return { data: stats, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Clear cache for specific patterns
  static clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  // Preload critical data
  static async preloadCriticalData(userId: string): Promise<void> {
    // Preload user profile and basic stats in parallel
    const promises = [
      this.getUserProfile(userId),
    ]

    // Don't await - let them load in background
    Promise.all(promises).catch(console.error)
  }
}
