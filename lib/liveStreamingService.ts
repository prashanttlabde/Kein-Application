// Live Streaming Service for Kein Platform
// Handles all live streaming operations with 100ms.live integration

import { getSupabase } from '@/lib/supabase';
import { CreatorLiveDetailsService } from '@/lib/creatorLiveDetailsService';
import type { 
  LiveStreamSession, 
  LiveStreamViewer, 
  LiveStreamSchedule,
  LiveStreamChat,
  LiveStreamProduct,
  SessionAnalytics,
  CreateLiveStreamSessionInput,
  StartLiveStreamInput,
  CreateViewerInput,
  SendChatMessageInput,
  HMSRoomConfig,
  HMSTokenResponse,
  CreatorLiveCredentials
} from '@/types/live-streaming';

// 100ms Configuration - Using environment variables with fallbacks
const HMS_APP_ACCESS_KEY = process.env.NEXT_PUBLIC_HMS_APP_ACCESS_KEY || '68f370a7145cb4e8449b14ff';
const HMS_APP_SECRET = process.env.NEXT_PUBLIC_HMS_APP_SECRET || 'NNXXwn9mrKuOu2Yzl6MLzoZ9DL4H671MLKY1V78dYgzWxLBQN6QTjKAQe3_6sXH6kqB0fOGO2xmcWNOYf_k8ioQDJ0sff5usOGpjQhFsLz6K7X2a6aCFKC7VGHZ19FqJUEJ5XylPgX7fVZsb71Q8OcDYismC64kwVgqrc3nnluE=';
const HMS_MANAGEMENT_TOKEN = process.env.NEXT_PUBLIC_HMS_MANAGEMENT_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NjE1NTM4MTgsImV4cCI6MTc2MjE1ODYxOCwianRpIjoiNGY2NTViNTgtZjZhMC00NDFhLTllOWYtNDczODNkMzcwMmRkIiwidHlwZSI6Im1hbmFnZW1lbnQiLCJ2ZXJzaW9uIjoyLCJuYmYiOjE3NjE1NTM4MTgsImFjY2Vzc19rZXkiOiI2OGYzNzBhNzE0NWNiNGU4NDQ5YjE0ZmYifQ.q705l7satIfKFkohOss8Z5v4Ddgp3WAjF1MwnFzzz1M';

// Validate environment variables
if (!HMS_APP_ACCESS_KEY || !HMS_APP_SECRET || !HMS_MANAGEMENT_TOKEN) {
  console.error('❌ Missing 100ms environment variables. Please check your .env.local file.');
  console.error('Required variables: NEXT_PUBLIC_HMS_APP_ACCESS_KEY, NEXT_PUBLIC_HMS_APP_SECRET, NEXT_PUBLIC_HMS_MANAGEMENT_TOKEN');
}

export class LiveStreamingService {
  // =============================================================================
  // SESSION MANAGEMENT
  // =============================================================================

  /**
   * Check if creator has any active live streams
   */
  static async checkActiveLiveStreams(creatorId: string): Promise<{ hasActiveStream: boolean; activeStream?: LiveStreamSession; error?: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('live_stream_sessions')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('status', 'live')
        .limit(1);

      if (error) {
        return { hasActiveStream: false, error };
      }

      return {
        hasActiveStream: data && data.length > 0,
        activeStream: data && data.length > 0 ? data[0] : undefined
      };
    } catch (error) {
      console.error('Error checking active live streams:', error);
      return { hasActiveStream: false, error };
    }
  }

  /**
   * Create a new live stream session
   */
  static async createSession(sessionData: CreateLiveStreamSessionInput): Promise<{ data: LiveStreamSession | null; error: any }> {
    try {
      // Check for existing live streams
      const { hasActiveStream, activeStream } = await this.checkActiveLiveStreams(sessionData.creatorId);
      
      if (hasActiveStream && activeStream) {
        return {
          data: null,
          error: {
            message: `You already have an active live stream: "${activeStream.title}". Please end it before starting a new one.`,
            code: 'ACTIVE_STREAM_EXISTS',
            activeStream
          }
        };
      }

      // Get creator credentials and create HMS room
      const { roomId, roomCode, error: roomError } = await this.createHMSRoom(
        sessionData.title || 'Live Stream',
        sessionData.creatorId
      );

      if (roomError) {
        return { data: null, error: roomError };
      }

      // Generate auth token for the room
      const { token, error: tokenError } = await this.generateHMSToken(roomId, sessionData.creatorId, 'broadcaster');

      if (tokenError) {
        return { data: null, error: tokenError };
      }

      // Create session with HMS data
      const { data, error } = await getSupabase()
        .from('live_stream_sessions')
        .insert({
          creator_id: sessionData.creatorId,
          title: sessionData.title,
          description: sessionData.description,
          scheduled_start_time: sessionData.scheduledStartTime,
          status: 'live', // Set status to 'live' immediately for "Go Live Now" flow
          actual_start_time: new Date().toISOString(), // Set start time
          max_viewers: sessionData.maxViewers || 1000,
          hms_room_id: roomId,
          hms_room_code: roomCode,
          hms_auth_token: token,
          stream_config: {
            isRecordingEnabled: sessionData.isRecordingEnabled ?? true,
            isChatEnabled: sessionData.isChatEnabled ?? true,
            isProductsShowcase: sessionData.isProductsShowcase ?? true,
            visibility: sessionData.visibility || 'public',
            thumbnailUrl: sessionData.thumbnailUrl
          }
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating live stream session:', error);
      return { data: null, error };
    }
  }

  /**
   * Start a live stream session with 100ms integration
   */
  static async startSession(sessionId: string, streamingData: StartLiveStreamInput): Promise<{ data: LiveStreamSession | null; error: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('live_stream_sessions')
        .update({
          status: 'live',
          actual_start_time: new Date().toISOString(),
          hms_room_id: streamingData.roomId,
          hms_room_code: streamingData.roomCode,
          stream_config: {
            streamKey: streamingData.streamKey,
            streamUrl: streamingData.streamUrl,
            hlsUrl: streamingData.hlsUrl,
            rtmpUrl: streamingData.rtmpUrl
          }
        })
        .eq('id', sessionId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error starting live stream session:', error);
      return { data: null, error };
    }
  }

  /**
   * End a live stream session
   */
  static async endSession(sessionId: string, recordingUrl?: string): Promise<{ data: LiveStreamSession | null; error: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('live_stream_sessions')
        .update({
          status: 'ended',
          actual_end_time: new Date().toISOString(),
          stream_config: {
            recordingUrl: recordingUrl
          }
        })
        .eq('id', sessionId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error ending live stream session:', error);
      return { data: null, error };
    }
  }

  /**
   * Get live stream session by ID
   */
  static async getSession(sessionId: string): Promise<{ data: LiveStreamSession | null; error: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('live_stream_sessions')
        .select(`
          *,
          creator:profiles(full_name, username, avatar_url)
        `)
        .eq('id', sessionId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching live stream session:', error);
      return { data: null, error };
    }
  }

  /**
   * Get sessions by creator
   */
  static async getSessionsBycreator(creatorId: string, status?: string): Promise<{ data: LiveStreamSession[] | null; error: any }> {
    try {
      let query = getSupabase()
        .from('live_stream_sessions')
        .select(`
          *,
          creator:profiles(full_name, username, avatar_url)
        `)
        .eq('creator_id', creatorId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching creator sessions:', error);
      return { data: null, error };
    }
  }

  /**
   * Get live sessions (for public viewing)
   */
  static async getLiveSessions(): Promise<{ data: LiveStreamSession[] | null; error: any }> {
    try {
      console.log('🔍 Fetching live sessions...');
      
      // Query all live sessions
      const { data: sessions, error } = await getSupabase()
        .from('live_stream_sessions')
        .select('*')
        .eq('status', 'live')
        .order('actual_start_time', { ascending: false });

      if (error) {
        console.error('❌ Error fetching live sessions:', error);
        return { data: null, error };
      }

      console.log(`📺 Found ${sessions?.length || 0} live sessions`);

      // If we have sessions, try to enrich with creator data from profiles table
      if (sessions && sessions.length > 0) {
        // Get unique creator IDs
        const creatorIds = [...new Set(sessions.map((s: any) => s.creator_id))];
        
        // Fetch creator data from profiles table
        const { data: profiles } = await getSupabase()
          .from('profiles')
          .select('id, full_name, username, followers_count, avatar_url')
          .in('id', creatorIds)
          .eq('is_creator', true);

        // Merge creator data into sessions
        const enrichedSessions = sessions.map((session: any) => {
          const profile = profiles?.find((p: any) => p.id === session.creator_id);
          return {
            ...session,
            creator: profile ? {
              id: profile.id,
              display_name: profile.full_name || profile.username || 'Unknown Creator',
              followers_count: profile.followers_count || 0,
              avatar_url: profile.avatar_url
            } : {
              display_name: 'Unknown Creator',
              followers_count: 0
            }
          };
        });

        console.log('✅ Enriched sessions with creator data from profiles');
        return { data: enrichedSessions as LiveStreamSession[], error: null };
      }

      return { data: sessions as LiveStreamSession[], error: null };
    } catch (error) {
      console.error('❌ Unexpected error fetching live sessions:', error);
      return { data: null, error };
    }
  }

  // =============================================================================
  // 100MS INTEGRATION
  // =============================================================================

  /**
   * Create a 100ms room for live streaming using creator credentials
   */
  static async createHMSRoom(roomName: string, userId: string): Promise<{ roomId: string; roomCode: string; error?: any }> {
    try {
      console.log('🔍 Creating HMS room for user:', userId);
      
      // Get creator live credentials
      const { data: credentials, error: credError } = await CreatorLiveDetailsService.getCreatorLiveCredentials(userId);
      
      console.log('🔍 Creator credentials result:', { credentials, credError });
      
      if (credError || !credentials) {
        console.error('❌ No creator credentials found:', credError);
        return { 
          roomId: '', 
          roomCode: '', 
          error: 'Creator does not have live streaming credentials. Please contact admin to set up your credentials.' 
        };
      }

      // Use existing room codes from go_live_details table
      if (credentials.broadcasterRoomCode && credentials.broadcasterAuthToken) {
        console.log('✅ Using existing creator room credentials:', {
          roomCode: credentials.broadcasterRoomCode,
          hasAuthToken: !!credentials.broadcasterAuthToken
        });
        return {
          roomId: credentials.broadcasterRoomCode, // Using room code as room ID
          roomCode: credentials.broadcasterRoomCode
        };
      }

      console.log('⚠️ No existing credentials found, creating new room...');
      const templateId = credentials.templateId || '68f370d9033903926e625a7a';
      
      const response = await fetch('https://api.100ms.live/v2/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HMS_MANAGEMENT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName,
          description: `Live streaming room for ${roomName}`,
          template_id: templateId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create HMS room:', errorData);
        throw new Error(`Failed to create room: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const roomData = await response.json();
      
      // Use the actual HMS room ID as the room code
      // HMS requires the room_id for authentication, not a custom generated code
      console.log('✅ HMS Room created:', { id: roomData.id, name: roomData.name });
      
      return {
        roomId: roomData.id,
        roomCode: roomData.id  // CRITICAL: Use HMS room ID, not a generated code
      };
    } catch (error) {
      console.error('Error creating HMS room:', error);
      return { roomId: '', roomCode: '', error };
    }
  }

  /**
   * Generate authentication token for 100ms room access using creator credentials
   */
  static async generateHMSToken(roomId: string, userId: string, role: string = 'broadcaster'): Promise<{ token: string; error?: any }> {
    try {
      // Get creator live credentials
      const { data: credentials, error: credError } = await CreatorLiveDetailsService.getCreatorLiveCredentials(userId);
      
      if (credError || !credentials) {
        return { 
          token: '', 
          error: 'Creator does not have live streaming credentials' 
        };
      }

      // Use existing auth token from go_live_details table
      if (role === 'broadcaster' && credentials.broadcasterAuthToken) {
        console.log('Using existing broadcaster auth token');
        return { token: credentials.broadcasterAuthToken };
      }
      
      if (role === 'viewer-realtime' && credentials.viewerRealtimeAuthToken) {
        console.log('Using existing viewer auth token');
        return { token: credentials.viewerRealtimeAuthToken };
      }

      // Fallback: Generate a new token for the room
      const token = await this.createJWTToken(roomId, userId, role);
      return { token };
    } catch (error) {
      console.error('Error generating HMS token:', error);
      return { token: '', error };
    }
  }

  /**
   * Generate a room code for easy access
   */
  private static generateRoomCode(roomId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${HMS_APP_ACCESS_KEY.substring(0, 8)}-${timestamp}-${random}`;
  }

  /**
   * Create JWT token for 100ms authentication
   */
  private static async createJWTToken(roomId: string, userId: string, role: string): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      access_key: HMS_APP_ACCESS_KEY,
      room_id: roomId,
      user_id: userId,
      role: role,
      type: 'app',
      version: 2,
      iat: now,
      exp: now + (24 * 60 * 60), // 24 hours
      jti: `${userId}-${roomId}-${now}-${Math.random().toString(36).substring(2)}`
    };

    try {
      const encodedHeader = btoa(JSON.stringify(header));
      const encodedPayload = btoa(JSON.stringify(payload));
      const unsignedToken = `${encodedHeader}.${encodedPayload}`;
      
      // For client-side, we'll use a simplified approach
      // In production, this should be done server-side
      const signature = await this.hmacSHA256(unsignedToken, HMS_APP_SECRET);
      const token = `${unsignedToken}.${signature}`;
      
      return token;
    } catch (error) {
      console.error('Error creating JWT token:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  /**
   * Generate HMAC-SHA256 signature
   */
  private static async hmacSHA256(message: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(message)
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  // =============================================================================
  // VIEWER MANAGEMENT
  // =============================================================================

  /**
   * Add viewer to session
   */
  static async addViewer(viewerData: CreateViewerInput): Promise<{ data: LiveStreamViewer | null; error: any }> {
    try {
      // Get user info for viewer_name
      let viewerName = 'Anonymous';
      if (viewerData.userId) {
        const { data: userData } = await getSupabase()
          .from('profiles')
          .select('display_name, email')
          .eq('id', viewerData.userId)
          .single();
        
        if (userData) {
          viewerName = userData.display_name || userData.email?.split('@')[0] || 'Anonymous';
        }
      }

      // Prepare device info JSON
      const deviceInfo = {
        ip_address: viewerData.ipAddress,
        user_agent: viewerData.userAgent,
        country: viewerData.country,
        city: viewerData.city,
        device_type: viewerData.deviceType,
        browser: viewerData.browser,
        viewer_type: viewerData.viewerType || 'customer'
      };

      const { data, error } = await getSupabase()
        .from('live_stream_viewers')
        .insert({
          session_id: viewerData.sessionId,
          viewer_id: viewerData.userId,
          viewer_name: viewerName,
          is_anonymous: !viewerData.userId || viewerData.viewerType === 'anonymous',
          device_info: deviceInfo
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error adding viewer:', error);
      return { data: null, error };
    }
  }

  /**
   * Update viewer status (when leaving)
   */
  static async updateViewerStatus(viewerId: string, watchDuration: number): Promise<{ data: LiveStreamViewer | null; error: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('live_stream_viewers')
        .update({
          left_at: new Date().toISOString(),
          duration: watchDuration
        })
        .eq('id', viewerId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating viewer status:', error);
      return { data: null, error };
    }
  }

  /**
   * Get session viewers
   */
  static async getSessionViewers(sessionId: string): Promise<{ data: LiveStreamViewer[] | null; error: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('live_stream_viewers')
        .select('*')
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching session viewers:', error);
      return { data: null, error };
    }
  }

  // =============================================================================
  // CHAT MANAGEMENT
  // =============================================================================

  /**
   * Send chat message
   */
  static async sendChatMessage(messageData: SendChatMessageInput): Promise<{ data: LiveStreamChat | null; error: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('live_stream_chat')
        .insert({
          session_id: messageData.sessionId,
          user_id: messageData.userId,
          message: messageData.message,
          message_type: messageData.messageType || 'chat',
          username: messageData.username,
          is_moderator: messageData.iscreator || false
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error sending chat message:', error);
      return { data: null, error };
    }
  }

  /**
   * Get chat messages for session
   */
  static async getChatMessages(sessionId: string, limit: number = 50): Promise<{ data: LiveStreamChat[] | null; error: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('live_stream_chat')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return { data: null, error };
    }
  }

  // =============================================================================
  // PRODUCT SHOWCASE
  // =============================================================================

  /**
   * Add product to live stream
   */
  static async addProductToStream(productData: {
    sessionId: string;
    productId: string;
    displayOrder?: number;
    liveStreamPrice?: number;
    discountPercentage?: number;
    limitedQuantity?: number;
  }): Promise<{ data: LiveStreamProduct | null; error: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('live_stream_products')
        .insert({
          session_id: productData.sessionId,
          product_id: productData.productId,
          shown_at: new Date().toISOString()
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error adding product to stream:', error);
      return { data: null, error };
    }
  }

  /**
   * Get products in live stream
   */
  static async getStreamProducts(sessionId: string): Promise<{ data: LiveStreamProduct[] | null; error: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('live_stream_products')
        .select(`
          *,
          product:products(*)
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Error fetching stream products:', error);
      return { data: null, error };
    }
  }

  // =============================================================================
  // ANALYTICS
  // =============================================================================

  /**
   * Get session analytics
   */
  static async getSessionAnalytics(sessionId: string): Promise<{ data: SessionAnalytics | null; error: any }> {
    try {
      const { data, error } = await getSupabase()
        .from('session_analytics_summary')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching session analytics:', error);
      return { data: null, error };
    }
  }

  // =============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // =============================================================================

  /**
   * Real-time session updates subscription
   */
  static subscribeToSessionUpdates(sessionId: string, callback: (payload: any) => void) {
    return getSupabase()
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_stream_sessions',
          filter: `id=eq.${sessionId}`
        },
        callback
      )
      .subscribe();
  }

  /**
   * Real-time chat subscription
   */
  static subscribeToChatMessages(sessionId: string, callback: (payload: any) => void) {
    return getSupabase()
      .channel(`chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_stream_chat',
          filter: `session_id=eq.${sessionId}`
        },
        callback
      )
      .subscribe();
  }

  /**
   * Real-time viewer updates subscription
   */
  static subscribeToViewerUpdates(sessionId: string, callback: (payload: any) => void) {
    return getSupabase()
      .channel(`viewers-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_stream_viewers',
          filter: `session_id=eq.${sessionId}`
        },
        callback
      )
      .subscribe();
  }
}

