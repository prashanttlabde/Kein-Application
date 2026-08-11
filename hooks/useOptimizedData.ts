/**
 * Optimized data fetching hooks
 * Uses PerformanceOptimizer for caching and deduplication
 */

import { useState, useEffect, useCallback } from 'react';
import * as React from 'react';
import { PerformanceOptimizer } from '@/lib/performanceOptimizer';

/**
 * Hook for fetching reels with caching
 */
export function useOptimizedReels(params: {
  page?: number;
  limit?: number;
  creatorId?: string;
  autoFetch?: boolean;
} = {}) {
  const { page = 0, limit = 10, creatorId, autoFetch = true } = params;
  
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await PerformanceOptimizer.getReelsOptimized({
        page,
        limit,
        creatorId,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
        setHasMore(result.hasMore);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, creatorId]);

  useEffect(() => {
    if (autoFetch) {
      fetchReels();
    }
  }, [autoFetch, fetchReels]);

  return {
    reels: data,
    loading,
    error,
    hasMore,
    refetch: fetchReels,
  };
}

/**
 * Hook for fetching live sessions with caching
 */
export function useOptimizedLiveSessions(params: {
  status?: 'live' | 'scheduled' | 'ended';
  limit?: number;
  autoFetch?: boolean;
  enabled?: boolean;
} = {}) {
  const { status = 'live', limit = 20, autoFetch = true, enabled = true } = params;
  
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchSessions = useCallback(async () => {
    if (!enabled) return; // Don't fetch if disabled
    
    setLoading(true);
    setError(null);

    try {
      const result = await PerformanceOptimizer.getLiveSessionsOptimized({
        status,
        limit,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [status, limit, enabled]);

  useEffect(() => {
    if (autoFetch && enabled) {
      fetchSessions();
    }
  }, [autoFetch, enabled, fetchSessions]);

  // Auto-refresh live sessions every 30 seconds
  useEffect(() => {
    if (!autoFetch || status !== 'live' || !enabled) return;

    const interval = setInterval(() => {
      fetchSessions();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoFetch, status, enabled, fetchSessions]);

  return {
    sessions: data,
    loading,
    error,
    refetch: fetchSessions,
  };
}

/**
 * Hook for fetching user profile with caching
 */
export function useOptimizedUserProfile(userId: string | null | undefined, autoFetch = true) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await PerformanceOptimizer.getUserProfileOptimized(userId);

      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoFetch && userId) {
      fetchProfile();
    }
  }, [autoFetch, userId, fetchProfile]);

  return {
    profile: data,
    loading,
    error,
    refetch: fetchProfile,
  };
}

/**
 * Hook for fetching featured creators with caching
 */
export function useOptimizedFeaturedCreators(limit = 8, autoFetch = true) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const hasFetchedRef = React.useRef(false);

  const fetchCreators = useCallback(async () => {
    if (hasFetchedRef.current && data) return; // Prevent duplicate fetches
    
    setLoading(true);
    setError(null);

    try {
      const result = await PerformanceOptimizer.getFeaturedCreatorsOptimized(limit);

      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
        hasFetchedRef.current = true;
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [limit, data]);

  useEffect(() => {
    if (autoFetch) {
      fetchCreators();
    }
  }, [autoFetch, fetchCreators]);

  return {
    creators: data,
    loading,
    error,
    refetch: fetchCreators,
  };
}

/**
 * Hook for prefetching home page data
 */
export function useHomePageData(autoFetch = true) {
  const [data, setData] = useState<{
    reels: any[] | null;
    liveSessions: any[] | null;
    creators: any[] | null;
  }>({
    reels: null,
    liveSessions: null,
    creators: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    try {
      const result = await PerformanceOptimizer.prefetchHomePageData();
      
      setData({
        reels: result.reels,
        liveSessions: result.liveSessions,
        creators: result.creators,
      });
      
      setErrors(result.errors);
    } catch (err) {
      setErrors([err]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, [autoFetch, fetchAll]);

  return {
    ...data,
    loading,
    errors,
    refetch: fetchAll,
  };
}
