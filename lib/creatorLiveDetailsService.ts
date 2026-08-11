// Creator Live Details Service
// Handles creator live streaming credentials management
// Used by admin dashboard for credential assignment after creator verification

import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import type {
  CreatorLiveDetails,
  AdminCreatorLiveDetails,
  CreatorOwnLiveDetails,
  CreateCreatorLiveDetailsInput,
  UpdateCreatorLiveDetailsInput,
  VerifyCreatorLiveDetailsInput,
  CreatorLiveCredentials
} from '@/types/live-streaming';

export class CreatorLiveDetailsService {
  // =============================================================================
  // ADMIN OPERATIONS
  // =============================================================================

  /**
   * Get all creator live details for admin dashboard
   */
  static async getAllCreatorLiveDetails(): Promise<{ data: AdminCreatorLiveDetails[] | null; error: any }> {
    try {
      const response = await fetch('/api/admin/creator-live-details', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to fetch creator live details' };
      }

      const result = await response.json();
      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error fetching all creator live details:', error);
      return { data: null, error };
    }
  }

  /**
   * Get creator live details by user ID (admin only)
   */
  static async getCreatorLiveDetailsByUserId(userId: string): Promise<{ data: CreatorLiveDetails | null; error: any }> {
    try {
      // Use service role for admin operations to bypass RLS
      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        throw new Error('Service role not configured');
      }
      const { data, error } = await supabaseAdmin
        .from('go_live_details')
        .select('*')
        .eq('user_id', userId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching creator live details by user ID:', error);
      return { data: null, error };
    }
  }

  /**
   * Create creator live details (admin only)
   */
  static async createCreatorLiveDetails(detailsData: CreateCreatorLiveDetailsInput): Promise<{ data: CreatorLiveDetails | null; error: any }> {
    try {
      console.log('========== SERVICE: CREATE CREATOR LIVE DETAILS ==========');
      console.log('Details Data:', JSON.stringify(detailsData, null, 2));

      const response = await fetch('/api/admin/creator-live-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(detailsData),
      });

      console.log('API Response Status:', response.status);
      console.log('API Response OK:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', JSON.stringify(errorData, null, 2));
        return { data: null, error: errorData.error || 'Failed to create creator live details' };
      }

      const result = await response.json();
      console.log('API Success Response:', JSON.stringify(result, null, 2));
      return { data: result.data, error: null };
    } catch (error) {
      console.error('Service Error creating creator live details:', error);
      return { data: null, error };
    }
  }

  /**
   * Update creator live details (admin only)
   */
  static async updateCreatorLiveDetails(userId: string, updates: UpdateCreatorLiveDetailsInput): Promise<{ data: CreatorLiveDetails | null; error: any }> {
    try {
      const response = await fetch('/api/admin/creator-live-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to update creator live details' };
      }

      const result = await response.json();
      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error updating creator live details:', error);
      return { data: null, error };
    }
  }

  /**
   * Verify creator live credentials (admin only)
   */
  static async verifyCreatorLiveCredentials(verifyData: VerifyCreatorLiveDetailsInput): Promise<{ success: boolean; error: any }> {
    try {
      const response = await fetch('/api/admin/creator-live-details', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to verify creator live credentials' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error verifying creator live credentials:', error);
      return { success: false, error };
    }
  }

  /**
   * Deactivate creator live credentials (admin only)
   */
  static async deactivateCreatorLiveCredentials(userId: string, adminUserId: string, adminNotes?: string): Promise<{ success: boolean; error: any }> {
    try {
      const params = new URLSearchParams({
        userId,
        adminUserId,
        ...(adminNotes && { adminNotes })
      });

      const response = await fetch(`/api/admin/creator-live-details?${params}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to deactivate creator live credentials' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deactivating creator live credentials:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete creator live details (admin only)
   */
  static async deleteCreatorLiveDetails(userId: string): Promise<{ success: boolean; error: any }> {
    try {
      // Use service role for admin operations to bypass RLS
      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        throw new Error('Service role not configured');
      }
      const { error } = await supabaseAdmin
        .from('go_live_details')
        .delete()
        .eq('user_id', userId);

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting creator live details:', error);
      return { success: false, error };
    }
  }

  // =============================================================================
  // CREATOR OPERATIONS
  // =============================================================================

  /**
   * Get creator's own live details
   */
  static async getOwnLiveDetails(): Promise<{ data: CreatorOwnLiveDetails | null; error: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('creator_own_live_details')
        .select('*')
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching own live details:', error);
      return { data: null, error };
    }
  }

  /**
   * Get creator/seller live credentials for streaming
   */
  static async getCreatorLiveCredentials(userId: string): Promise<{ data: CreatorLiveCredentials | null; error: any }> {
    try {
      console.log('🔍 Getting live credentials for user:', userId);
      
      // Query the unified go_live_details table
      const { data, error } = await getSupabase()
        .from('go_live_details')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('🔍 Database query result:', { data, error });

      if (error) {
        // If no record found, it's not necessarily an error
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No live details found for user:', userId);
          return { data: null, error: { message: 'No live streaming credentials configured. Please contact admin.' } };
        }
        console.error('❌ Database query error:', error);
        return { data: null, error };
      }

      if (!data) {
        console.log('ℹ️ No live details found for user:', userId);
        return { data: null, error: { message: 'No live streaming credentials configured. Please contact admin.' } };
      }

      // Transform the database record to match CreatorLiveCredentials interface
      const credentials: CreatorLiveCredentials = {
        broadcasterRoomCode: data.broadcaster_room_code,
        broadcasterAuthToken: data.broadcaster_auth_token,
        viewerRealtimeRoomCode: data.viewer_realtime_room_code,
        viewerRealtimeAuthToken: data.viewer_realtime_auth_token,
        templateId: data.template_id,
        appAccessKey: data.app_access_key,
        isActive: data.is_active || false,
        isVerified: data.is_verified || false
      };

      console.log('✅ Transformed credentials:', { ...credentials, broadcasterAuthToken: '***', viewerRealtimeAuthToken: '***' });

      return { data: credentials, error: null };
    } catch (error) {
      console.error('Error fetching creator live credentials:', error);
      return { data: null, error };
    }
  }

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  /**
   * Check if creator has live credentials (active)
   */
  static async hasVerifiedLiveCredentials(userId: string): Promise<{ hasCredentials: boolean; error?: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('go_live_details')
        .select('is_active')
        .eq('user_id', userId)
        .single();

      if (error) {
        return { hasCredentials: false, error };
      }

      return { 
        hasCredentials: data?.is_active === true 
      };
    } catch (error) {
      console.error('Error checking live credentials:', error);
      return { hasCredentials: false, error };
    }
  }

  /**
   * Get pending creator live details (not active - since all are auto-verified now)
   */
  static async getPendingCreatorLiveDetails(): Promise<{ data: AdminCreatorLiveDetails[] | null; error: any }> {
    try {
      // Use service role for admin operations to bypass RLS
      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        throw new Error('Service role not configured');
      }
      const { data, error } = await supabaseAdmin
        .from('admin_go_live_details')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching pending creator live details:', error);
      return { data: null, error };
    }
  }

  /**
   * Get active creator live details
   */
  static async getActiveCreatorLiveDetails(): Promise<{ data: AdminCreatorLiveDetails[] | null; error: any }> {
    try {
      // Use service role for admin operations to bypass RLS
      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        throw new Error('Service role not configured');
      }
      const { data, error } = await supabaseAdmin
        .from('admin_go_live_details')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching active creator live details:', error);
      return { data: null, error };
    }
  }

  /**
   * Search creator live details by name or username
   */
  static async searchCreatorLiveDetails(searchTerm: string): Promise<{ data: AdminCreatorLiveDetails[] | null; error: any }> {
    try {
      // Use service role for admin operations to bypass RLS
      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        throw new Error('Service role not configured');
      }
      const { data, error } = await supabaseAdmin
        .from('admin_go_live_details')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error searching creator live details:', error);
      return { data: null, error };
    }
  }
}

