// Minimal auth lib for compatibility
import { createClient } from '@/utils/supabase/client'

export const auth = {
  hasRole: (profile: any, role: string) => {
    if (!profile) return false
    
    switch (role) {
      case 'admin':
        return profile.role === 'admin'
      case 'creator':
        return profile.creator_verified === true
      case 'seller':
        return profile.seller_verified === true
      default:
        return false
    }
  },
  
  processVerification: async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('verification_requests')
      .update({
        status,
        admin_notes: notes,
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId)
    
    if (error) throw error
  },

  requestVerification: async (type: 'creator' | 'seller', verificationData: any) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('verification_requests')
      .insert({
        type,
        verification_data: verificationData,
        status: 'pending',
        created_at: new Date().toISOString()
      })
    
    return { data, error }
  },
  
  canAccess: (profile: any, feature: string) => {
    if (!profile) return false
    
    switch (feature) {
      case 'admin':
        return profile.role === 'admin'
      case 'creator':
        return profile.creator_verified === true
      case 'seller':
        return profile.seller_verified === true
      default:
        return true
    }
  }
}
