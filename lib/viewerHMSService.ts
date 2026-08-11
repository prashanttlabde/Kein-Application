// Viewer HMS Service - Handles fetching HMS credentials for viewers
import { getSupabase } from '@/lib/supabase';

export interface CreatorHMSCredentials {
  id: string;
  display_name: string;
  hms_room_code?: string;
  hms_auth_token?: string;
  hms_viewer_room_code?: string;
  hms_viewer_auth_token?: string;
  hms_room_id?: string;
  is_streaming_enabled: boolean;
}

export interface LiveStreamWithHMSCredentials {
  id: string;
  title: string;
  description?: string;
  status: string;
  creator_id: string;
  room_code?: string;
  current_viewers?: number;
  peak_viewers?: number;
  total_messages?: number;
  total_reactions?: number;
  actual_start_time?: string;
  scheduled_start_time?: string;
  visibility?: string;
  thumbnail_url?: string;
  is_products_showcase?: boolean;
  // HMS credentials from creator
  hms_viewer_room_code?: string;
  hms_viewer_auth_token?: string;
  // creator info
  creator?: {
    display_name: string;
    followers_count: number;
  };
}

export class ViewerHMSService {
  /**
   * Get creator HMS credentials by creator ID
   * NOTE: HMS credentials are now stored in go_live_details table
   * This method now fetches from profiles table for basic info
   */
  static async getCreatorHMSCredentials(creatorId: string): Promise<{
    data: CreatorHMSCredentials | null;
    error: any;
  }> {
    try {
      const supabase = getSupabase();
      
      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, username, followers_count, is_creator, is_seller')
        .eq('id', creatorId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return { data: null, error: profileError };
      }

      // Get HMS credentials from unified go_live_details table
      // Viewers need the BROADCASTER room code (to join the same room) and broadcaster auth token
      const { data: credentials, error: credsError } = await supabase
        .from('go_live_details')
        .select('broadcaster_room_code, broadcaster_auth_token')
        .eq('user_id', creatorId)
        .eq('is_active', true)
        .single();

      if (credsError && credsError.code !== 'PGRST116') {
        console.error('Error fetching credentials:', credsError);
      }

      const result: CreatorHMSCredentials = {
        id: profile.id,
        display_name: profile.full_name || profile.username || 'Unknown',
        hms_room_code: credentials?.broadcaster_room_code, // Broadcaster's room code
        hms_auth_token: credentials?.broadcaster_auth_token,
        hms_viewer_room_code: credentials?.viewer_realtime_room_code, // Viewers join the viewer realtime room
        hms_viewer_auth_token: credentials?.viewer_realtime_auth_token,
        is_streaming_enabled: !!credentials
      };

      return { data: result, error: null };
    } catch (error) {
      console.error('Error in getCreatorHMSCredentials:', error);
      return { data: null, error };
    }
  }

  /**
   * Get live stream session with HMS credentials
   */
  static async getSessionWithHMSCredentials(sessionId: string): Promise<{
    data: LiveStreamWithHMSCredentials | null;
    error: any;
  }> {
    try {
      console.log('Fetching session with HMS credentials for sessionId:', sessionId);
      const supabase = getSupabase();
      
      // Try to use the function that bypasses RLS first
      try {
        const { data: funcData, error: funcError } = (await (supabase as any).rpc('get_live_session_with_hms_credentials', {
          p_session_id: sessionId
        })) as any;

        if (!funcError && funcData && funcData.length > 0) {
          const sessionData = funcData[0] as any;
          console.log('Using RLS bypass function - Raw session data:', {
            session_id: sessionData.id,
            session_status: sessionData.status,
            creator_has_hms_auth_token: !!sessionData.hms_auth_token,
            creator_has_hms_room_code: !!sessionData.hms_room_code,
            creator_has_viewer_auth_token: !!sessionData.hms_viewer_auth_token
          });

          // Transform function result to match expected format
          const transformedData: LiveStreamWithHMSCredentials = {
            id: sessionData.id,
            creator_id: sessionData.creator_id,
            title: sessionData.title,
            description: sessionData.description,
            status: sessionData.status,
            room_code: sessionData.room_code || sessionData.hms_room_code,
            current_viewers: 0,
            peak_viewers: 0,
            total_messages: 0,
            total_reactions: 0,
            actual_start_time: sessionData.actual_start_time,
            scheduled_start_time: sessionData.scheduled_start_time,
            visibility: sessionData.visibility,
            thumbnail_url: sessionData.thumbnail_url,
            is_products_showcase: sessionData.is_products_showcase,
            // HMS credentials
            hms_viewer_room_code: sessionData.hms_viewer_room_code || sessionData.hms_room_code,
            hms_viewer_auth_token: sessionData.hms_viewer_auth_token || sessionData.hms_auth_token,
            creator: {
              display_name: sessionData.creator_display_name || 'Unknown Host',
              followers_count: sessionData.creator_followers_count || 0
            }
          };

          console.log('Transformed session data from function:', {
            sessionId: transformedData.id,
            title: transformedData.title,
            status: transformedData.status,
            hasViewerAuthToken: !!transformedData.hms_viewer_auth_token,
            hasViewerRoomCode: !!transformedData.hms_viewer_room_code,
            viewerAuthTokenPreview: transformedData.hms_viewer_auth_token ? `${transformedData.hms_viewer_auth_token.substring(0, 20)}...` : 'none',
            viewerRoomCode: transformedData.hms_viewer_room_code,
            creatorName: transformedData.creator?.display_name
          });

          return { data: transformedData, error: null };
        }
      } catch (funcError) {
        console.log('RLS bypass function failed, falling back to direct query:', funcError);
      }

      // Fallback to original query method
      // Join with profiles table (which has the foreign key), then get HMS credentials from go_live_details
      const { data: sessionData, error: sessionError } = await supabase
        .from('live_stream_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        return { data: null, error: sessionError };
      }

      if (!sessionData) {
        console.error('No session found with ID:', sessionId);
        return { data: null, error: 'Session not found' };
      }

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, username, followers_count, is_seller, is_creator')
        .eq('id', sessionData.creator_id)
        .single();

      if (profileError) {
        console.warn('Error fetching profile (non-critical):', profileError);
      }

      console.log('Profile data fetched:', {
        creator_id: sessionData.creator_id,
        profile: profileData,
        error: profileError
      });

      // Get HMS credentials from unified go_live_details table
      // Viewers need the viewer realtime room code and auth token
      // Note: go_live_details might have RLS enabled, so we query without eq filters first
      const { data: hmsDataArray, error: hmsError } = await supabase
        .from('go_live_details')
        .select('user_id, broadcaster_room_code, viewer_realtime_room_code, viewer_realtime_auth_token, is_verified, is_active')
        .eq('user_id', sessionData.creator_id);

      console.log('HMS credentials query result:', {
        error: hmsError,
        errorCode: hmsError?.code,
        errorMessage: hmsError?.message,
        dataLength: hmsDataArray?.length,
        data: hmsDataArray
      });

      if (hmsError) {
        console.error('Error fetching HMS credentials from go_live_details:', hmsError);
        console.error('Error details:', {
          code: hmsError.code,
          message: hmsError.message,
          details: hmsError.details,
          hint: hmsError.hint
        });
        console.error('Attempted to fetch for user_id:', sessionData.creator_id);
        return {
          data: null,
          error: `Failed to fetch HMS credentials: ${hmsError.message}`
        };
      }

      // Filter for active and verified credentials
      const hmsData = hmsDataArray?.find((cred: any) => cred.is_active && cred.is_verified);

      if (!hmsData) {
        console.error('No verified HMS credentials found in go_live_details for user_id:', sessionData.creator_id);
        console.error('Available credentials:', hmsDataArray);
        return { 
          data: null, 
          error: `No viewer authentication token available. Please contact the host to set up viewer access.` 
        };
      }

      console.log('Successfully fetched HMS credentials:', {
        user_id: sessionData.creator_id,
        has_broadcaster_room_code: !!hmsData.broadcaster_room_code,
        has_viewer_room_code: !!hmsData.viewer_realtime_room_code,
        has_viewer_auth_token: !!hmsData.viewer_realtime_auth_token,
        broadcaster_room_code: hmsData.broadcaster_room_code,
        viewer_room_code: hmsData.viewer_realtime_room_code
      });

      // Combine all data
      const data = {
        ...sessionData,
        creator: {
          display_name: profileData?.full_name || profileData?.username || 'Unknown Host',
          followers_count: profileData?.followers_count || 0,
          hms_viewer_room_code: hmsData.viewer_realtime_room_code, // Viewers join the viewer realtime room
          hms_viewer_auth_token: hmsData.viewer_realtime_auth_token
        }
      };

      console.log('Raw session data from database:', {
        session_id: data.id,
        session_status: data.status,
        creator_data: data.creator,
        creator_has_hms_auth_token: !!data.creator?.hms_viewer_auth_token,
        creator_has_hms_room_code: !!data.creator?.hms_viewer_room_code
      });

      // Transform the data to include HMS credentials at the top level
      const transformedData: LiveStreamWithHMSCredentials = {
        ...data,
        hms_viewer_room_code: data.creator?.hms_viewer_room_code || data.room_code || null,
        hms_viewer_auth_token: data.creator?.hms_viewer_auth_token || null,
        creator: {
          display_name: data.creator?.display_name || 'Unknown Host',
          followers_count: data.creator?.followers_count || 0
        }
      };

      console.log('Transformed session data:', {
        sessionId: transformedData.id,
        title: transformedData.title,
        status: transformedData.status,
        hasViewerAuthToken: !!transformedData.hms_viewer_auth_token,
        hasViewerRoomCode: !!transformedData.hms_viewer_room_code,
        viewerAuthTokenPreview: transformedData.hms_viewer_auth_token ? `${transformedData.hms_viewer_auth_token.substring(0, 20)}...` : 'none',
        viewerRoomCode: transformedData.hms_viewer_room_code,
        creatorName: transformedData.creator?.display_name
      });

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error in getSessionWithHMSCredentials:', error);
      return { data: null, error };
    }
  }

  /**
   * Helper to extract viewer room code from session
   */
  static getViewerRoomCode(session: any): string | null {
    return session?.hms_viewer_room_code || session?.hms_room_code || session?.room_code || null;
  }

  /**
   * Helper to extract viewer auth token from session
   */
  static getViewerAuthToken(session: any): string | null {
    return session?.hms_viewer_auth_token || session?.hms_auth_token || null;
  }

  /**
   * Check if session has proper viewer credentials
   */
  static hasViewerCredentials(session: any): boolean {
    const roomCode = this.getViewerRoomCode(session);
    const authToken = this.getViewerAuthToken(session);
    return !!(roomCode && authToken);
  }
}

export default ViewerHMSService;

