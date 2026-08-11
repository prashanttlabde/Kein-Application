import { createClient } from '@supabase/supabase-js'
import { createClient as createBrowserClient } from '@/utils/supabase/client'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Deprecated: Use createClient from @/utils/supabase/client instead
// This is kept for backward compatibility only
export const getSupabase = () => {
  return createBrowserClient()
}

// Deprecated: Use createClient from @/utils/supabase/client instead
export const supabase = typeof window !== 'undefined' ? createBrowserClient() : null

// Lazy admin client creation to avoid build-time issues
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

export const getSupabaseAdmin = () => {
  if (!_supabaseAdmin && supabaseUrl && supabaseServiceKey) {
    _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return _supabaseAdmin
}

// Backward compatibility
export const supabaseAdmin = getSupabaseAdmin()
