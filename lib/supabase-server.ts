import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient(request?: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // For API routes with request
  if (request) {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Cannot set cookies in API routes
          // Client will handle cookie setting
        }
      },
    })
  }

  // For server components, use the standard approach
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async get(name: string) {
        try {
          const cookieStore = await cookies()
          const cookie = cookieStore.get(name)
          return cookie?.value
        } catch {
          console.error('Error getting cookie:', name)
          return undefined
        }
      },
      async set(name: string, value: string, options?: { [key: string]: unknown }) {
        try {
          const cookieStore = await cookies()
          cookieStore.set(name, value, options)
        } catch {
          console.warn('Could not set cookie:', name)
        }
      },
      async remove(name: string, options?: { [key: string]: unknown }) {
        try {
          const cookieStore = await cookies()
          cookieStore.delete(name)
        } catch {
          console.warn('Could not remove cookie:', name)
        }
      },
    },
  })
}

// Helper function to get authenticated user from request
export async function getAuthenticatedUser(request: NextRequest) {
  const supabase = await createServerSupabaseClient(request)

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting authenticated user:', error)
      return { user: null, error }
    }

    return { user, error: null }
  } catch (error) {
    console.error('Exception getting authenticated user:', error)
    return { user: null, error }
  }
}
