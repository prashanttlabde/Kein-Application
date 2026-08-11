'use cache'

import { cacheLife } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

/**
 * Cached profile fetcher for server components
 * This uses Next.js 16 Cache Components for instant loading
 * 
 * @param userId - The user ID to fetch profile for
 * @returns User profile data or null
 */
export async function getCachedProfile(userId: string) {
  cacheLife('minutes') // Cache for 5 minutes
  
  try {
    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Cached profile fetch error:', error)
      return null
    }
    
    return profile
  } catch (error) {
    console.error('Error in getCachedProfile:', error)
    return null
  }
}

/**
 * Get multiple profiles in one cached call
 * Useful for creator listings, followers, etc.
 */
export async function getCachedProfiles(userIds: string[]) {
  'use cache'
  cacheLife('minutes')
  
  try {
    const supabase = await createClient()
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)
    
    if (error) {
      console.error('Cached profiles fetch error:', error)
      return []
    }
    
    return profiles || []
  } catch (error) {
    console.error('Error in getCachedProfiles:', error)
    return []
  }
}
