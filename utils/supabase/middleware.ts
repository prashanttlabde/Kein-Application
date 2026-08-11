import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user }
  } = await supabase.auth.getUser()

  // Minimal logging for auth failures only in development
  const isDev = process.env.NODE_ENV === 'development'
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                          request.nextUrl.pathname.startsWith('/creator-dashboard') ||
                          request.nextUrl.pathname.startsWith('/seller-dashboard')
  
  // Only log auth issues on protected routes
  if (isDev && isProtectedRoute && !user) {
    console.log(`Auth redirect: ${request.nextUrl.pathname} -> /auth`)
  }

  // Protected routes that require authentication (already defined above)
  // const protectedRoutes = ['/dashboard']

  // If accessing protected route without session, redirect to auth
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Admin routes handling
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname.startsWith('/admin-portal')) {
      return supabaseResponse
    }
    
    if (!request.nextUrl.pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Check for role-specific dashboard routes
  if (user && (request.nextUrl.pathname.startsWith('/dashboard/') || 
                  request.nextUrl.pathname.startsWith('/creator-dashboard') ||
                  request.nextUrl.pathname.startsWith('/seller-dashboard'))) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        const path = request.nextUrl.pathname

        // Check creator dashboard access
        if (path.startsWith('/creator-dashboard')) {
          if (!profile.creator_verified) {
            return NextResponse.redirect(new URL('/?error=creator_access_required', request.url))
          }
        }

        // Check seller dashboard access
        if (path.startsWith('/seller-dashboard')) {
          if (!profile.seller_verified) {
            return NextResponse.redirect(new URL('/?error=seller_access_required', request.url))
          }
        }

        // Check creator routes in regular dashboard
        if (path.startsWith('/dashboard/reels') || path.startsWith('/dashboard/live')) {
          if (!profile.creator_verified) {
            return NextResponse.redirect(new URL('/dashboard?error=creator_access_required', request.url))
          }
        }

        // Check seller routes in regular dashboard
        if (path.startsWith('/dashboard/products') || path.startsWith('/dashboard/contracts')) {
          if (!profile.seller_verified) {
            return NextResponse.redirect(new URL('/dashboard?error=seller_access_required', request.url))
          }
        }
      }
    } catch (error) {
      // Only log profile errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Profile check error:', error)
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}
