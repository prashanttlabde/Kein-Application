// Live Streaming Types for Kein Platform
// Comprehensive type definitions for live streaming functionality

// Creator Live Details Types
export interface CreatorLiveDetails {
  id: string;
  user_id: string;
  
  // 100ms.live Credentials for Broadcaster
  broadcaster_room_code?: string;
  broadcaster_auth_token?: string;
  
  // 100ms.live Credentials for Viewer Realtime
  viewer_realtime_room_code?: string;
  viewer_realtime_auth_token?: string;
  
  // Additional Configuration
  template_id?: string;
  app_access_key?: string;
  
  // Status and Management
  is_active: boolean;
  is_verified: boolean;
  verified_at?: string;
  verified_by?: string;
  
  // Admin Notes
  admin_notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface AdminCreatorLiveDetails extends CreatorLiveDetails {
  creator_name?: string;
  creator_username?: string;
  creator_email?: string;
  is_creator?: boolean;
  creator_verified?: boolean;
  creator_joined_at?: string;
  verified_by_name?: string;
  verified_by_username?: string;
}

export interface CreatorOwnLiveDetails {
  id: string;
  user_id: string;
  broadcaster_room_code?: string;
  viewer_realtime_room_code?: string;
  template_id?: string;
  app_access_key?: string;
  is_active: boolean;
  is_verified: boolean;
  verified_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types for Creator Live Details
export interface CreateCreatorLiveDetailsInput {
  userId: string;
  broadcasterRoomCode?: string;
  broadcasterAuthToken?: string;
  viewerRealtimeRoomCode?: string;
  viewerRealtimeAuthToken?: string;
  templateId?: string;
  appAccessKey?: string;
  adminNotes?: string;
}

export interface UpdateCreatorLiveDetailsInput {
  broadcasterRoomCode?: string;
  broadcasterAuthToken?: string;
  viewerRealtimeRoomCode?: string;
  viewerRealtimeAuthToken?: string;
  templateId?: string;
  appAccessKey?: string;
  isActive?: boolean;
  adminNotes?: string;
}

export interface VerifyCreatorLiveDetailsInput {
  creatorUserId: string;
  adminUserId: string;
  adminNotes?: string;
}

export interface CreatorLiveCredentials {
  broadcasterRoomCode?: string;
  broadcasterAuthToken?: string;
  viewerRealtimeRoomCode?: string;
  viewerRealtimeAuthToken?: string;
  templateId?: string;
  appAccessKey?: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface LiveStreamSession {
  id: string;
  creator_id: string;
  
  // Session Identification
  title: string;
  description?: string;
  
  // Scheduling
  scheduled_start_time?: string;
  
  // Actual Session Times
  actual_start_time?: string;
  actual_end_time?: string;
  
  // Session Status
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  
  // 100ms Integration
  hms_room_id?: string;
  hms_room_code?: string;
  hms_auth_token?: string;
  
  // Stream Configuration (JSONB)
  stream_config?: {
    isRecordingEnabled?: boolean;
    isChatEnabled?: boolean;
    isProductsShowcase?: boolean;
    visibility?: 'public' | 'private' | 'unlisted';
    thumbnailUrl?: string;
    streamKey?: string;
    streamUrl?: string;
    hlsUrl?: string;
    rtmpUrl?: string;
  };
  
  // Performance Metrics
  max_viewers: number;
  total_viewers: number;
  avg_viewer_duration: number;
  
  // Engagement Metrics
  total_likes: number;
  total_comments: number;
  total_shares: number;
  
  // Commercial Metrics
  products_shown: number;
  clicks_generated: number;
  sales_generated: number;
  
  // Joined Data
  creator?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface LiveStreamViewer {
  id: string;
  session_id: string;
  user_id?: string;
  viewer_type: 'customer' | 'creator' | 'wholesaler' | 'anonymous';
  
  // Viewer Information
  username?: string;
  avatar_url?: string;
  display_name?: string;
  
  // Session Tracking
  joined_at: string;
  left_at?: string;
  is_still_watching: boolean;
  watch_duration_minutes: number;
  
  // Device Information
  ip_address?: string;
  user_agent?: string;
  country?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  
  // Engagement
  messages_sent: number;
  reactions_sent: number;
  products_viewed: number;
  products_clicked: number;
  orders_placed: number;
  
  created_at: string;
  updated_at: string;
}

export interface LiveStreamChat {
  id: string;
  session_id: string;
  viewer_id?: string;
  user_id?: string;
  
  // Message Content
  message: string;
  message_type: 'chat' | 'reaction' | 'system' | 'product_highlight';
  
  // User Information
  username?: string;
  avatar_url?: string;
  is_creator: boolean;
  
  // Message Metadata
  sent_at: string;
  is_deleted: boolean;
  deleted_at?: string;
  
  // Product Reference (for product highlights)
  product_id?: string;
  
  created_at: string;
  updated_at: string;
}

export interface LiveStreamProduct {
  id: string;
  session_id: string;
  product_id: string;
  
  // Display Configuration
  display_order: number;
  is_featured: boolean;
  featured_at?: string;
  
  // Pricing
  live_stream_price?: number;
  discount_percentage?: number;
  limited_quantity?: number;
  
  // Metrics
  views_count: number;
  clicks_count: number;
  add_to_cart_count: number;
  orders_count: number;
  revenue: number;
  
  created_at: string;
  updated_at: string;
  
  // Joined product data
  product?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    category?: string;
    brand?: string;
    stock_quantity?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface LiveStreamSchedule {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  
  // Scheduling
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  timezone: string;
  
  // Configuration
  products_to_showcase?: string[];
  stream_category?: string;
  expected_duration_minutes?: number;
  target_audience?: string;
  
  // Recurrence
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly';
  days_of_week?: number[];
  
  // Status
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  
  created_at: string;
  updated_at: string;
}

export interface SessionAnalytics {
  session_id: string;
  
  // Viewer Analytics
  total_viewers: number;
  peak_concurrent_viewers: number;
  average_viewers: number;
  unique_viewers: number;
  
  // Engagement Analytics
  total_messages: number;
  total_reactions: number;
  total_shares: number;
  engagement_rate: number;
  
  // Watch Time Analytics
  total_watch_time_minutes: number;
  average_watch_time_minutes: number;
  retention_rate: number;
  
  // Commercial Analytics
  products_showcased: number;
  total_clicks: number;
  total_orders: number;
  total_revenue: number;
  conversion_rate: number;
  click_through_rate: number;
  
  // Quality Metrics
  stream_quality_score: number;
  buffering_events: number;
  connection_issues: number;
  
  // Geographic Analytics
  top_countries: Array<{ country: string; viewers: number }>;
  top_cities: Array<{ city: string; viewers: number }>;
  
  // Device Analytics
  device_breakdown: Array<{ device_type: string; percentage: number }>;
  browser_breakdown: Array<{ browser: string; percentage: number }>;
  
  generated_at: string;
}

// API Request/Response Types
export interface CreateLiveStreamSessionInput {
  creatorId: string;
  title: string;
  description?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  thumbnailUrl?: string;
  maxViewers?: number;
  isRecordingEnabled?: boolean;
  isChatEnabled?: boolean;
  isProductsShowcase?: boolean;
  visibility?: 'public' | 'private' | 'unlisted';
}

export interface StartLiveStreamInput {
  roomId: string;
  roomCode: string;
  streamKey: string;
  streamUrl: string;
  hlsUrl: string;
  rtmpUrl: string;
}

export interface CreateViewerInput {
  sessionId: string;
  userId?: string;
  viewerType?: 'customer' | 'creator' | 'wholesaler' | 'anonymous';
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
}

export interface SendChatMessageInput {
  sessionId: string;
  viewerId?: string;
  userId?: string;
  message: string;
  messageType?: 'chat' | 'reaction' | 'system' | 'product_highlight';
  username?: string;
  avatarUrl?: string;
  iscreator?: boolean;
}

// 100ms Integration Types
export interface HMSRoomConfig {
  roomId: string;
  roomCode: string;
  templateId: string;
  userId: string;
  role: 'broadcaster' | 'viewer-realtime' | 'viewer';
}

export interface HMSTokenResponse {
  token: string;
  roomId: string;
  userId: string;
  role: string;
  expiresAt: string;
}

// Component Props Types
export interface LiveStreamProps {
  sessionId?: string;
  isHost?: boolean;
  onStreamStart?: (session: LiveStreamSession) => void;
  onStreamEnd?: (session: LiveStreamSession) => void;
}

export interface LiveStreamViewerProps {
  sessionId: string;
  userId?: string;
  onJoin?: (viewer: LiveStreamViewer) => void;
  onLeave?: (viewer: LiveStreamViewer) => void;
}

export interface LiveStreamChatProps {
  sessionId: string;
  userId?: string;
  isEnabled?: boolean;
  onMessage?: (message: LiveStreamChat) => void;
}

// Hook Return Types
export interface UseLiveStreamSessionReturn {
  session: LiveStreamSession | null;
  loading: boolean;
  error: string | null;
  startStream: (config: StartLiveStreamInput) => Promise<void>;
  endStream: () => Promise<void>;
}

export interface UseLiveStreamChatReturn {
  messages: LiveStreamChat[];
  loading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  sendReaction: (reaction: string) => Promise<void>;
}

export interface UseLiveStreamAnalyticsReturn {
  analytics: SessionAnalytics | null;
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

