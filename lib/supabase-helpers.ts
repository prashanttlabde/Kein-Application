// Supabase helpers for compatibility
import { createClient } from '@/utils/supabase/client'

export const clearInvalidSession = async () => {
  try {
    const client = createClient()
    
    // Clear all auth-related items from storage
    if (typeof window !== 'undefined') {
      // Remove the main auth token
      localStorage.removeItem('supabase.auth.token')
      
      // Clear any other Supabase auth keys (they usually start with 'sb-')
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
      
      // Also clear session storage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key)
        }
      })
    }
    
    // Sign out from Supabase
    await client.auth.signOut()
    
    console.log('✅ Invalid session cleared successfully')
  } catch (error) {
    console.error('Error clearing invalid session:', error)
  }
}
