'use client'

import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

// Re-export types for convenience
export type { UserProfile } from '@/lib/database'

/**
 * Hook to access auth context
 * Use this in any component that needs auth state
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
