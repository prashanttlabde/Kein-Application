// Live Streaming Hooks for Kein Platform
// Custom React hooks for live streaming functionality

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LiveStreamingService } from '@/lib/liveStreamingService';
import { CreatorLiveDetailsService } from '@/lib/creatorLiveDetailsService';
import type {
  LiveStreamSession,
  LiveStreamViewer,
  LiveStreamChat,
  LiveStreamProduct,
  SessionAnalytics,
  CreateLiveStreamSessionInput,
  StartLiveStreamInput,
  CreateViewerInput,
  SendChatMessageInput,
  UseLiveStreamSessionReturn,
  UseLiveStreamChatReturn,
  UseLiveStreamAnalyticsReturn,
  CreatorLiveDetails,
  AdminCreatorLiveDetails,
  CreatorOwnLiveDetails,
  CreateCreatorLiveDetailsInput,
  UpdateCreatorLiveDetailsInput,
  VerifyCreatorLiveDetailsInput,
  CreatorLiveCredentials
} from '@/types/live-streaming';

// =============================================================================
// LIVE STREAM SESSION HOOK
// =============================================================================

export const useLiveStreamSession = (sessionId?: string): UseLiveStreamSessionReturn => {
  const [session, setSession] = useState<LiveStreamSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load session data
  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await LiveStreamingService.getSession(sessionId);
      if (error) {
        setError(error.message || 'Failed to load session');
      } else {
        setSession(data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startStream = useCallback(async (config: StartLiveStreamInput) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await LiveStreamingService.startSession(sessionId, config);
      if (error) {
        setError(error.message || 'Failed to start stream');
      } else {
        setSession(data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const endStream = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await LiveStreamingService.endSession(sessionId);
      if (error) {
        setError(error.message || 'Failed to end stream');
      } else {
        setSession(data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  return {
    session,
    loading,
    error,
    startStream,
    endStream
  };
};

// =============================================================================
// CREATOR SESSIONS HOOK
// =============================================================================

export const useCreatorSessions = (creatorId: string, status?: string) => {
  const [sessions, setSessions] = useState<LiveStreamSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (creatorId) {
      loadSessions();
    }
  }, [creatorId, status]);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await LiveStreamingService.getSessionsBycreator(creatorId, status);
      if (error) {
        setError(error.message || 'Failed to load sessions');
      } else {
        setSessions(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: CreateLiveStreamSessionInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await LiveStreamingService.createSession(sessionData);
      if (error) {
        setError(error.message || 'Failed to create session');
        return null;
      } else {
        setSessions(prev => [data!, ...prev]);
        return data;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    sessions,
    loading,
    error,
    createSession,
    refreshSessions: loadSessions
  };
};

// Backward compatibility export
export const useInfluencerSessions = useCreatorSessions;

// =============================================================================
// LIVE SESSIONS HOOK (for viewers)
// =============================================================================

export const useLiveSessions = () => {
  const [sessions, setSessions] = useState<LiveStreamSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLiveSessions();
  }, []);

  const loadLiveSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await LiveStreamingService.getLiveSessions();
      if (error) {
        setError(error.message || 'Failed to load live sessions');
      } else {
        setSessions(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    sessions,
    loading,
    error,
    refreshSessions: loadLiveSessions
  };
};

// =============================================================================
// VIEWER SESSION HOOK
// =============================================================================

export const useViewerSession = (sessionId: string, userId?: string) => {
  const [viewer, setViewer] = useState<LiveStreamViewer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchStartTime = useRef<number>(Date.now());

  const joinSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const viewerData: CreateViewerInput = {
        sessionId,
        userId,
        viewerType: userId ? 'customer' : 'anonymous',
        userAgent: navigator.userAgent,
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'
      };

      const { data, error } = await LiveStreamingService.addViewer(viewerData);
      if (error) {
        setError(error.message || 'Failed to join session');
      } else {
        setViewer(data);
        watchStartTime.current = Date.now();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const leaveSession = async () => {
    if (!viewer) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const watchDuration = Math.floor((Date.now() - watchStartTime.current) / 60000); // minutes
      const { error } = await LiveStreamingService.updateViewerStatus(viewer.id, watchDuration);
      if (error) {
        setError(error.message || 'Failed to leave session');
      } else {
        setViewer(null);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    viewer,
    loading,
    error,
    joinSession,
    leaveSession
  };
};

// =============================================================================
// LIVE STREAM CHAT HOOK
// =============================================================================

export const useLiveStreamChat = (sessionId: string): UseLiveStreamChatReturn => {
  const [messages, setMessages] = useState<LiveStreamChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMessages();
    
    // Subscribe to real-time chat updates
    const subscription = LiveStreamingService.subscribeToChatMessages(sessionId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setMessages(prev => [payload.new, ...prev]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await LiveStreamingService.getChatMessages(sessionId);
      if (error) {
        setError(error.message || 'Failed to load messages');
      } else {
        setMessages(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const messageData: SendChatMessageInput = {
        sessionId,
        userId: user?.id,
        message: message.trim(),
        username: user?.user_metadata?.full_name || 'Anonymous',
        avatarUrl: user?.user_metadata?.avatar_url,
        iscreator: user?.user_metadata?.role === 'creator'
      };

      const { error } = await LiveStreamingService.sendChatMessage(messageData);
      if (error) {
        setError(error.message || 'Failed to send message');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendReaction = async (reaction: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const messageData: SendChatMessageInput = {
        sessionId,
        userId: user?.id,
        message: reaction,
        messageType: 'reaction',
        username: user?.user_metadata?.full_name || 'Anonymous',
        avatarUrl: user?.user_metadata?.avatar_url,
        iscreator: user?.user_metadata?.role === 'creator'
      };

      const { error } = await LiveStreamingService.sendChatMessage(messageData);
      if (error) {
        setError(error.message || 'Failed to send reaction');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendReaction
  };
};

// =============================================================================
// STREAM PRODUCTS HOOK
// =============================================================================

export const useStreamProducts = (sessionId: string) => {
  const [products, setProducts] = useState<LiveStreamProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [sessionId]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await LiveStreamingService.getStreamProducts(sessionId);
      if (error) {
        setError(error.message || 'Failed to load products');
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: {
    productId: string;
    displayOrder?: number;
    liveStreamPrice?: number;
    discountPercentage?: number;
    limitedQuantity?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await LiveStreamingService.addProductToStream({
        sessionId,
        ...productData
      });
      if (error) {
        setError(error.message || 'Failed to add product');
      } else {
        setProducts(prev => [...prev, data!]);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    refreshProducts: loadProducts
  };
};

// =============================================================================
// SESSION ANALYTICS HOOK
// =============================================================================

export const useSessionAnalytics = (sessionId: string): UseLiveStreamAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [sessionId]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await LiveStreamingService.getSessionAnalytics(sessionId);
      if (error) {
        setError(error.message || 'Failed to load analytics');
      } else {
        setAnalytics(data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = useCallback(async () => {
    await loadAnalytics();
  }, [sessionId]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics
  };
};

// =============================================================================
// LIVE STREAM CREATION HOOK
// =============================================================================

export const useCreateLiveStream = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createLiveStream = async (sessionData: Omit<CreateLiveStreamSessionInput, 'creatorId'>) => {
    if (!user?.id) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await LiveStreamingService.createSession({
        ...sessionData,
        creatorId: user.id
      });
      
      if (error) {
        setError(error.message || 'Failed to create live stream');
        return null;
      }
      
      return data;
    } catch (err) {
      setError('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createLiveStream,
    loading,
    error
  };
};

/**
 * Hook for ending live stream sessions
 */
export const useEndLiveStream = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endSession = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await LiveStreamingService.endSession(sessionId);
      
      if (error) {
        setError(error.message || 'Failed to end live stream');
        return null;
      }
      
      return data;
    } catch (err) {
      setError('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    endSession,
    loading,
    error
  };
};

// =============================================================================
// CREATOR LIVE DETAILS HOOKS
// =============================================================================

/**
 * Hook for admin to manage all creator live details
 */
export const useAdminCreatorLiveDetails = () => {
  const [details, setDetails] = useState<AdminCreatorLiveDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await CreatorLiveDetailsService.getAllCreatorLiveDetails();
      if (error) {
        setError(error.message || 'Failed to load creator live details');
      } else {
        setDetails(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createDetails = async (detailsData: CreateCreatorLiveDetailsInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await CreatorLiveDetailsService.createCreatorLiveDetails(detailsData);
      if (error) {
        setError(error.message || 'Failed to create creator live details');
        return null;
      } else {
        await loadDetails(); // Refresh the list
        return data;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDetails = async (userId: string, updates: UpdateCreatorLiveDetailsInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await CreatorLiveDetailsService.updateCreatorLiveDetails(userId, updates);
      if (error) {
        setError(error.message || 'Failed to update creator live details');
        return null;
      } else {
        await loadDetails(); // Refresh the list
        return data;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyCredentials = async (verifyData: VerifyCreatorLiveDetailsInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const { success, error } = await CreatorLiveDetailsService.verifyCreatorLiveCredentials(verifyData);
      if (!success) {
        setError(error?.message || 'Failed to verify creator credentials');
        return false;
      } else {
        await loadDetails(); // Refresh the list
        return true;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deactivateCredentials = async (userId: string, adminUserId: string, adminNotes?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { success, error } = await CreatorLiveDetailsService.deactivateCreatorLiveCredentials(userId, adminUserId, adminNotes);
      if (!success) {
        setError(error?.message || 'Failed to deactivate creator credentials');
        return false;
      } else {
        await loadDetails(); // Refresh the list
        return true;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDetails = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { success, error } = await CreatorLiveDetailsService.deleteCreatorLiveDetails(userId);
      if (!success) {
        setError(error?.message || 'Failed to delete creator live details');
        return false;
      } else {
        await loadDetails(); // Refresh the list
        return true;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, []);

  return {
    details,
    loading,
    error,
    createDetails,
    updateDetails,
    verifyCredentials,
    deactivateCredentials,
    deleteDetails,
    refreshDetails: loadDetails
  };
};

/**
 * Hook for creators to view their own live details
 */
export const useCreatorOwnLiveDetails = () => {
  const [details, setDetails] = useState<CreatorOwnLiveDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await CreatorLiveDetailsService.getOwnLiveDetails();
      if (error) {
        setError(error.message || 'Failed to load live details');
      } else {
        setDetails(data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, []);

  return {
    details,
    loading,
    error,
    refreshDetails: loadDetails
  };
};

/**
 * Hook to get creator live credentials for streaming
 */
export const useCreatorLiveCredentials = (userId?: string) => {
  const [credentials, setCredentials] = useState<CreatorLiveCredentials | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadCredentials = async () => {
    if (!userId && !user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await CreatorLiveDetailsService.getCreatorLiveCredentials(userId || user?.id || '');
      if (error) {
        setError(error.message || 'Failed to load live credentials');
      } else {
        setCredentials(data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId || user?.id) {
      loadCredentials();
    }
  }, [userId, user?.id]);

  return {
    credentials,
    loading,
    error,
    refreshCredentials: loadCredentials
  };
};

/**
 * Hook to check if creator has verified live credentials
 */
export const useCreatorLiveCredentialsCheck = (userId?: string) => {
  const [hasCredentials, setHasCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const checkCredentials = async () => {
    if (!userId && !user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { hasCredentials: hasCreds, error } = await CreatorLiveDetailsService.hasVerifiedLiveCredentials(userId || user?.id || '');
      if (error) {
        setError(error.message || 'Failed to check live credentials');
      } else {
        setHasCredentials(hasCreds);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId || user?.id) {
      checkCredentials();
    }
  }, [userId, user?.id]);

  return {
    hasCredentials,
    loading,
    error,
    refreshCheck: checkCredentials
  };
};

