import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function getAuthenticatedSupabaseClient(request: NextRequest) {
  // First try with cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // Cannot set cookies in API routes
        },
      },
    }
  )
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // If no user from cookies, try Authorization header
    if (!user || userError) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        
        // Create a new client with the token
        const tokenSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return []
              },
              setAll() {
                // No-op
              },
            },
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        )
        
        const { data: tokenData, error: tokenError } = await tokenSupabase.auth.getUser()
        if (tokenData?.user && !tokenError) {
          return { supabase: tokenSupabase, user: tokenData.user, error: null }
        }
      }
    }
    
    if (userError || !user) {
      console.log('Authentication failed:', userError?.message || 'No user found')
      return { supabase: null, user: null, error: 'Unauthorized' }
    }
    
    return { supabase, user, error: null }
  } catch (error) {
    console.error('Authentication error:', error)
    return { supabase: null, user: null, error: 'Unauthorized' }
  }
}
