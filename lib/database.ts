import { getSupabase, getSupabaseAdmin } from './supabase'
import { Database } from './types'

// Helper function to ensure supabase client is available
const ensureSupabase = () => {
  return getSupabase()
}

// Types for better type safety
export interface UserProfile {
  id: string
  email: string
  full_name: string
  username?: string
  avatar_url?: string
  phone?: string
  bio?: string
  website?: string
  location?: string
  role: 'user' | 'admin'
  is_creator: boolean
  is_seller: boolean
  creator_verified: boolean
  seller_verified: boolean
  followers_count?: number
  following_count?: number
  created_at: string
  updated_at: string
}

export interface VerificationRequest {
  id: string
  user_id: string
  type: 'creator' | 'seller'
  status: 'pending' | 'approved' | 'rejected'
  documents: string[]
  business_name?: string
  business_type?: string
  tax_id?: string
  bank_details?: Record<string, unknown>
  social_links?: string[]
  follower_count?: number
  additional_info?: Record<string, unknown>
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface VerificationRequestWithProfile extends VerificationRequest {
  profiles?: {
    full_name: string
    email: string
    username?: string
  }
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  seller_id: string
  is_active: boolean
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  seller_id: string
  creator_id: string
  product_ids: string[]
  commission_rate: number
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired'
  terms: string
  used_by_reel_id?: string
  created_at: string
  updated_at: string
}

export const database = {
  // User Profile Operations
  getUserProfile: async (userId: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  createUserProfile: async (profile: Partial<UserProfile>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('profiles')
      .insert(profile)
      .select()
      .single()
    return { data, error }
  },

  updateUserProfile: async (userId: string, updates: Partial<UserProfile>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Verification Operations
  createVerificationRequest: async (request: Partial<VerificationRequest>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('verification_requests')
      .insert(request)
      .select()
      .single()
    return { data, error }
  },

  getVerificationRequests: async (status?: string) => {
    const supabase = getSupabase();
    let query = supabase
      .from('verification_requests')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          username
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    return { data, error }
  },

  updateVerificationRequest: async (id: string, updates: Partial<VerificationRequest>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('verification_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  getUserVerificationRequests: async (userId: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Product Operations
  getProducts: async (sellerId?: string) => {
    const supabase = getSupabase();
    let query = supabase
      .from('products')
      .select(`
        *,
        profiles:seller_id (
          full_name,
          username
        )
      `)
      .eq('is_active', true)

    if (sellerId) {
      query = query.eq('seller_id', sellerId)
    }

    const { data, error } = await query
    return { data, error }
  },

  getProduct: async (id: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles:seller_id (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  createProduct: async (product: Partial<Product>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('products')
      .insert(product)
      .select()
      .single()
    return { data, error }
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  deleteProduct: async (id: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  // Contract Operations
  getContracts: async (userId?: string, role?: 'seller' | 'creator') => {
    const supabase = getSupabase();
    let query = supabase
      .from('contracts')
      .select(`
        *,
        seller:seller_id (
          full_name,
          username,
          avatar_url
        ),
        creator:creator_id (
          full_name,
          username,
          avatar_url
        )
      `)

    if (userId && role === 'seller') {
      query = query.eq('seller_id', userId)
    } else if (userId && role === 'creator') {
      query = query.eq('creator_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  createContract: async (contract: Partial<Contract>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('contracts')
      .insert(contract)
      .select()
      .single()
    return { data, error }
  },

  updateContract: async (id: string, updates: Partial<Contract>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Reel Operations
  getReels: async (creatorId?: string) => {
    const supabase = getSupabase();
    let query = supabase
      .from('reels')
      .select(`
        *,
        profiles:creator_id (
          full_name,
          username,
          avatar_url
        )
      `)

    if (creatorId) {
      query = query.eq('creator_id', creatorId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  createReel: async (reel: Record<string, unknown>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('reels')
      .insert(reel)
      .select()
      .single()
    return { data, error }
  },

  // Live Stream Operations
  getLiveStreams: async (isActive?: boolean) => {
    const supabase = getSupabase();
    let query = supabase
      .from('live_streams')
      .select(`
        *,
        profiles:host_id (
          full_name,
          username,
          avatar_url
        )
      `)

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  createLiveStream: async (stream: Record<string, unknown>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('live_streams')
      .insert(stream)
      .select()
      .single()
    return { data, error }
  },

  updateLiveStream: async (id: string, updates: Record<string, unknown>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('live_streams')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Order Operations
  getOrders: async (userId?: string, sellerId?: string) => {
    const supabase = getSupabase();
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            image_url,
            price
          )
        ),
        profiles:user_id (
          full_name,
          email
        )
      `)

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (sellerId) {
      query = query.eq('seller_id', sellerId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  createOrder: async (order: Record<string, unknown>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('orders')
      .insert(order)
      .select()
      .single()
    return { data, error }
  },

  // Cart Operations
  getCartItems: async (userId: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          stock_quantity
        )
      `)
      .eq('user_id', userId)
    return { data, error }
  },

  addToCart: async (cartItem: Record<string, unknown>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('cart_items')
      .upsert(cartItem)
      .select()
    return { data, error }
  },

  updateCartItem: async (id: string, updates: Record<string, unknown>) => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('cart_items')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  removeFromCart: async (id: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  clearCart: async (userId: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
    return { data, error }
  },

  // Analytics Operations
  getAnalytics: async () => {
    // This would be implemented based on specific analytics needs
    // For now, return basic stats
    const stats = {
      totalSales: 0,
      totalOrders: 0,
      totalViews: 0,
      totalEarnings: 0
    }
    return { data: stats, error: null }
  },

  // Admin Operations
  getAllUsers: async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Admin-specific verification operations (bypasses RLS)
  adminGetVerificationRequests: async (status?: string) => {
    try {
      // Check if admin client is available
      // Use admin client with service role key to bypass RLS
      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        return { data: null, error: new Error('Admin client not configured') }
      }
      let query = supabaseAdmin
        .from('verification_requests')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            username
          )
        `)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching verification requests:', error)
        return { data: null, error }
      }

      console.log('Successfully fetched verification requests:', data)
      return { data, error: null }
    } catch (error) {
      console.error('Exception in adminGetVerificationRequests:', error)
      return { data: null, error }
    }
  },

  adminUpdateVerificationRequest: async (id: string, updates: Partial<VerificationRequest>) => {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return { data: null, error: new Error('Admin client not configured') }
    }
    const { data, error } = await supabaseAdmin
      .from('verification_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  adminProcessVerification: async (
    requestId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ) => {
    try {
      // Update verification request
      const { data: request, error: requestError } = await database.adminUpdateVerificationRequest(requestId, {
        status,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })

      if (requestError || !request) {
        return { data: request, error: requestError }
      }

      // If approved, update user profile
      if (status === 'approved') {
        const requestData = request as any
        const updateData: Partial<UserProfile> = {}
        if (requestData.type === 'creator') {
          updateData.creator_verified = true
        } else {
          updateData.seller_verified = true
        }

        // Use admin client to update user profile
        const supabaseAdmin = getSupabaseAdmin();
        if (supabaseAdmin) {
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update(updateData)
            .eq('id', requestData.user_id)

          if (profileError) {
            console.error('Error updating user profile:', profileError)
          }
        }
      }

      return { data: request, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Admin user operations
  getAllAdminUsers: async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, full_name, is_active, last_login, created_at')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getAllContracts: async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        seller:seller_id (
          full_name,
          email,
          username
        ),
        creator:creator_id (
          full_name,
          email,
          username
        )
      `)
      .order('created_at', { ascending: false })

    // Transform the data to flatten the nested objects
    const transformedData = data?.map((contract: any) => ({
      ...contract,
      seller_name: contract.seller?.full_name,
      seller_email: contract.seller?.email,
      creator_name: contract.creator?.full_name,
      creator_email: contract.creator?.email,
      product_count: contract.product_ids?.length || 0
    }))

    return { data: transformedData, error }
  },

  getAllProducts: async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles:seller_id (
          full_name,
          email,
          username
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getAllOrders: async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            image_url
          )
        ),
        user:user_id (
          full_name,
          email
        ),
        seller:seller_id (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getAllReels: async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('reels')
      .select(`
        *,
        profiles:creator_id (
          full_name,
          email,
          username
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getAllLiveStreams: async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('live_streams')
      .select(`
        *,
        profiles:host_id (
          full_name,
          email,
          username
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Admin user management
  updateUserRole: async (userId: string, role: 'user' | 'admin') => {
    const supabase = getSupabase();
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  updateUserVerificationStatus: async (userId: string, type: 'creator' | 'seller', verified: boolean) => {
    const supabase = getSupabase();
    const updates: Partial<UserProfile> = {}
    if (type === 'creator') {
      updates.creator_verified = verified
    } else {
      updates.seller_verified = verified
    }

    const { data, error } = await (supabase as any)
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Follow Operations
  followUser: async (followingId: string) => {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await (supabase as any)
      .from('follows')
      .insert({ follower_id: user.id, following_id: followingId })
      .select()
      .single()
    return { data, error }
  },

  unfollowUser: async (followingId: string) => {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .select()
    return { data, error }
  },

  isFollowing: async (followerId: string, followingId: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle()
    return { data: !!data, error }
  },

  // Check if current user is following someone
  isCurrentUserFollowing: async (followingId: string) => {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: false, error: null }
    }

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .maybeSingle()
    return { data: !!data, error }
  },

  getFollowers: async (userId: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('follows')
      .select(`
        created_at,
        follower:follower_id (
          id,
          full_name,
          username,
          avatar_url,
          is_creator,
          creator_verified
        )
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getFollowing: async (userId: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('follows')
      .select(`
        created_at,
        following:following_id (
          id,
          full_name,
          username,
          avatar_url,
          is_creator,
          creator_verified
        )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getFollowCounts: async (userId: string) => {
    const supabase = getSupabase();
    const [followersResult, followingResult] = await Promise.all([
      supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('following_id', userId),
      supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('follower_id', userId)
    ])

    return {
      followers_count: followersResult.count || 0,
      following_count: followingResult.count || 0,
      error: followersResult.error || followingResult.error
    }
  },

  // Admin analytics
  getAdminStats: async () => {
    try {
      const supabase = getSupabase();
      // Get user counts
      const { data: users } = await supabase
        .from('profiles')
        .select('role, is_creator, is_seller, creator_verified, seller_verified')

      // Get contract stats
      const { data: contracts } = await supabase
        .from('contracts')
        .select('status, total_sales, total_commission')

      // Get product stats
      const { data: products } = await supabase
        .from('products')
        .select('is_active')

      // Get order stats
      const { data: orders } = await supabase
        .from('orders')
        .select('status, total_amount')

      const stats = {
        users: {
          total: users?.length || 0,
          admins: users?.filter((u: any) => u.role === 'admin').length || 0,
          creators: users?.filter((u: any) => u.is_creator).length || 0,
          verifiedcreators: users?.filter((u: any) => u.is_creator && u.creator_verified).length || 0,
          sellers: users?.filter((u: any) => u.is_seller).length || 0,
          verifiedSellers: users?.filter((u: any) => u.is_seller && u.seller_verified).length || 0
        },
        contracts: {
          total: contracts?.length || 0,
          active: contracts?.filter((c: any) => c.status === 'active').length || 0,
          pending: contracts?.filter((c: any) => c.status === 'pending').length || 0,
          totalSales: contracts?.reduce((sum: number, c: any) => sum + (c.total_sales || 0), 0) || 0,
          totalCommission: contracts?.reduce((sum: number, c: any) => sum + (c.total_commission || 0), 0) || 0
        },
        products: {
          total: products?.length || 0,
          active: products?.filter((p: any) => p.is_active).length || 0
        },
        orders: {
          total: orders?.length || 0,
          pending: orders?.filter((o: any) => o.status === 'pending').length || 0,
          completed: orders?.filter((o: any) => o.status === 'delivered').length || 0,
          totalRevenue: orders?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0
        }
      }

      return { data: stats, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}
