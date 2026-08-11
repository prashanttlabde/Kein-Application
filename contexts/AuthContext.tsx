'use client'

import React, { createContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { UserProfile } from '@/lib/database'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  isCreator: boolean
  isSeller: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isCreator: false,
  isSeller: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshAuth: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('📄 Fetching profile for user:', userId)
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      )
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (error) {
        console.warn('⚠️ Profile fetch error:', error)
        setProfile(null)
        return
      }

      console.log('✅ Profile loaded:', data.full_name || data.email)
      setProfile(data)
    } catch (error) {
      console.warn('❌ Profile fetch failed:', error)
      setProfile(null)
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        console.log('🚀 Initializing auth context...')
        // Add timeout to prevent hanging on getSession
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 3000)
        )
        
        const sessionPromise = supabase.auth.getSession()
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any

        if (!mounted) return

        if (session?.user) {
          console.log('✅ Initial session found:', session.user.email)
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          console.log('ℹ️ No initial session found')
        }
      } catch (error) {
        console.warn('❌ Auth initialization failed:', error)
        // Continue with no user - don't block the app
      } finally {
        if (mounted) {
          console.log('✅ Auth initialization complete')
          setLoading(false)
        }
      }
    }

    initAuth()

    // Backup timeout in case auth never resolves
    const backupTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth loading timeout - forcing completion')
        setLoading(false)
      }
    }, 5000)

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user')

        // Update user state immediately
        setUser(session?.user ?? null)

        // Handle specific events
        if (event === 'SIGNED_IN') {
          console.log('✅ User signed in:', session?.user?.email)
          if (session?.user) {
            await fetchProfile(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          setProfile(null)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed for:', session?.user?.email)
          // Only fetch profile if we don't have one
          if (session?.user && !profile) {
            await fetchProfile(session.user.id)
          }
        } else if (event === 'INITIAL_SESSION') {
          console.log('📋 Initial session loaded:', session?.user?.email || 'none')
          if (session?.user) {
            await fetchProfile(session.user.id)
          }
        } else {
          // For other events, fetch profile if user exists and we don't have it
          if (session?.user && !profile) {
            await fetchProfile(session.user.id)
          } else if (!session?.user) {
            setProfile(null)
          }
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      clearTimeout(backupTimeout)
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile, loading])

  const signOut = useCallback(async () => {
    console.log('👋 Signing out...')
    setUser(null)
    setProfile(null)
    await supabase.auth.signOut()
  }, [supabase])

  const refreshAuth = useCallback(async () => {
    console.log('🔄 Manually refreshing auth state...')
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      await fetchProfile(session.user.id)
    } else {
      setUser(null)
      setProfile(null)
    }
  }, [supabase, fetchProfile])

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isCreator: profile?.is_creator ?? false,
    isSeller: profile?.is_seller ?? false,
    signOut,
    refreshProfile,
    refreshAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
