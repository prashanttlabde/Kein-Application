// Type overrides for Supabase to handle strict typing issues
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    from(table: string): any
  }
}

// Global type helpers
declare global {
  type SupabaseResponse<T = any> = {
    data: T | null
    error: any
  }
  
  type SupabaseInsertResponse<T = any> = {
    data: T | null
    error: any
  }
}

export {}
