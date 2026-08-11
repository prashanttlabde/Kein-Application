import { getSupabaseAdmin } from './supabase'

// Server-only database wrapper using admin client
// DO NOT import this in client components
// This module provides server-side database access for Next.js server components

const ensureAdminSupabase = () => {
  return getSupabaseAdmin()
}

export const database = {
  // Get all reels (for server components)
  getReels: async () => {
    const supabase = ensureAdminSupabase()
    if (!supabase) {
      return { data: null, error: new Error('Supabase admin client not available') }
    }
    const { data, error } = await supabase
      .from('reels')
      .select(`
        *,
        profiles:creator_id (
          full_name,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Get all products (for server components)
  getProducts: async () => {
    const supabase = ensureAdminSupabase()
    if (!supabase) {
      return { data: null, error: new Error('Supabase admin client not available') }
    }
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Get creator profile by username (for server components)
  getCreatorByUsername: async (username: string) => {
    const supabase = ensureAdminSupabase()
    if (!supabase) {
      return { data: null, error: new Error('Supabase admin client not available') }
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('is_creator', true)
      .single()
    
    return { data, error }
  },

  // Get creator products (for server components)
  getCreatorProducts: async (creatorId: string) => {
    const supabase = ensureAdminSupabase()
    if (!supabase) {
      return { data: null, error: new Error('Supabase admin client not available') }
    }
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', creatorId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  }
}
