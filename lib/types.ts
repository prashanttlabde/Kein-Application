// Database type definitions for better type safety

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          username?: string
          avatar_url?: string
          phone?: string
          role: 'user' | 'admin'
          is_creator: boolean
          is_seller: boolean
          creator_verified: boolean
          seller_verified: boolean
          bio?: string
          website?: string
          social_links?: Record<string, unknown>
          followers_count?: number
          following_count?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          username?: string
          avatar_url?: string
          phone?: string
          role?: 'user' | 'admin'
          is_creator?: boolean
          is_seller?: boolean
          creator_verified?: boolean
          seller_verified?: boolean
          bio?: string
          website?: string
          social_links?: Record<string, unknown>
          followers_count?: number
          following_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          username?: string
          avatar_url?: string
          phone?: string
          role?: 'user' | 'admin'
          is_creator?: boolean
          is_seller?: boolean
          creator_verified?: boolean
          seller_verified?: boolean
          bio?: string
          website?: string
          social_links?: Record<string, unknown>
          followers_count?: number
          following_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          seller_id: string
          creator_id: string
          product_ids: string[]
          commission_rate: number
          status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired'
          terms?: string
          start_date?: string
          end_date?: string
          total_sales: number
          total_commission: number
          used_by_reel_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          creator_id: string
          product_ids?: string[]
          commission_rate: number
          status?: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired'
          terms?: string
          start_date?: string
          end_date?: string
          total_sales?: number
          total_commission?: number
          used_by_reel_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          creator_id?: string
          product_ids?: string[]
          commission_rate?: number
          status?: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired'
          terms?: string
          start_date?: string
          end_date?: string
          total_sales?: number
          total_commission?: number
          used_by_reel_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description?: string
          price: number
          image_url?: string
          images?: string[]
          category?: string
          seller_id: string
          is_active: boolean
          stock_quantity: number
          sku?: string
          weight?: number
          dimensions?: Record<string, unknown>
          tags?: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          price: number
          image_url?: string
          images?: string[]
          category?: string
          seller_id: string
          is_active?: boolean
          stock_quantity?: number
          sku?: string
          weight?: number
          dimensions?: Record<string, unknown>
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          image_url?: string
          images?: string[]
          category?: string
          seller_id?: string
          is_active?: boolean
          stock_quantity?: number
          sku?: string
          weight?: number
          dimensions?: Record<string, unknown>
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      reels: {
        Row: {
          id: string
          creator_id: string
          title: string
          description?: string
          video_url: string
          thumbnail_url?: string
          product_ids: string[]
          contract_id?: string
          view_count: number
          like_count: number
          comment_count: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string
          video_url: string
          thumbnail_url?: string
          product_ids?: string[]
          contract_id?: string
          view_count?: number
          like_count?: number
          comment_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string
          video_url?: string
          thumbnail_url?: string
          product_ids?: string[]
          contract_id?: string
          view_count?: number
          like_count?: number
          comment_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          seller_id: string
          reel_id?: string
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          tax_amount: number
          shipping_amount: number
          total_amount: number
          payment_status: string
          shipping_address: Record<string, unknown>
          billing_address?: Record<string, unknown>
          payment_method: string
          tracking_number?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          user_id: string
          seller_id: string
          reel_id?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          tax_amount?: number
          shipping_amount?: number
          total_amount: number
          payment_status?: string
          shipping_address: Record<string, unknown>
          billing_address?: Record<string, unknown>
          payment_method?: string
          tracking_number?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string
          seller_id?: string
          reel_id?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          total_amount?: number
          payment_status?: string
          shipping_address?: Record<string, unknown>
          billing_address?: Record<string, unknown>
          payment_method?: string
          tracking_number?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          reel_id?: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          reel_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          reel_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          data?: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          data?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          data?: Record<string, unknown>
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'admin'
      verification_status: 'pending' | 'approved' | 'rejected'
      verification_type: 'creator' | 'seller'
      contract_status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired'
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    }
  }
}

// Helper types for API responses
export type ApiResponse<T> = {
  data?: T
  error?: string
}

export type ContractWithRelations = Database['public']['Tables']['contracts']['Row'] & {
  seller?: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'username' | 'email' | 'avatar_url'>
  creator?: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'username' | 'email' | 'avatar_url'>
  products?: Array<Pick<Database['public']['Tables']['products']['Row'], 'id' | 'name' | 'price' | 'image_url' | 'category'>>
}

export type ProfileWithCounts = Database['public']['Tables']['profiles']['Row'] & {
  followers_count: number
  following_count: number
}

