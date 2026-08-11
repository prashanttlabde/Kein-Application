'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { OptimizedDatabase } from '@/lib/optimizedDatabase';
import { UserProfile } from '@/lib/database';

interface OptimizedAuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  isSeller: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Session storage keys
const SESSION_CACHE_KEY = 'auth_session_cache';
const PROFILE_CACHE_KEY = 'auth_profile_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Cache interface
interface CacheData<T> {
  data: T;
  timestamp: number;
}

// Cache utilities
const getCachedData = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    
    const parsed: CacheData<T> = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_EXPIRY) {
      sessionStorage.removeItem(key);
      return null;
    }
    
    return parsed.data;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
};

const setCachedData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache auth data:', error);
  }
};

export const useOptimizedAuth = (): OptimizedAuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fast profile fetch with caching
  const fetchProfile = useCallback(async (userId: string, useCache = true): Promise<void> => {
    try {
      // Check cache first
      if (useCache) {
        const cachedProfile = getCachedData<UserProfile>(`${PROFILE_CACHE_KEY}_${userId}`);
        if (cachedProfile) {
          setProfile(cachedProfile);
          return;
        }
      }

      const { data: profileData, error } = await OptimizedDatabase.getUserProfile(userId);

      if (error) {
        console.error('Auth: Profile fetch error:', error);
        setProfile(null);
        return;
      }

      if (profileData) {
        setCachedData(`${PROFILE_CACHE_KEY}_${userId}`, profileData);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Auth: Error fetching profile:', error);
      setProfile(null);
    }
  }, []);

  // Optimized initial session check
  const initializeAuth = useCallback(async (): Promise<void> => {
    try {
      // Check cached session first
      const cachedUser = getCachedData<User>(SESSION_CACHE_KEY);
      if (cachedUser) {
        setUser(cachedUser);
        await fetchProfile(cachedUser.id, true);
        setLoading(false);
        setInitialLoad(false);
        return;
      }

      // Get fresh session
      const supabase = getSupabase();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth: Session error:', error);
        setLoading(false);
        setInitialLoad(false);
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        setCachedData(SESSION_CACHE_KEY, currentUser);
        await fetchProfile(currentUser.id, false);
      }

      setLoading(false);
      setInitialLoad(false);
    } catch (error) {
      console.error('Auth: Error initializing:', error);
      setLoading(false);
      setInitialLoad(false);
    }
  }, [fetchProfile]);

  // Optimized auth state change handler
  const handleAuthChange = useCallback(async (event: string, session: any) => {
    const currentUser = session?.user ?? null;
    setUser(currentUser);

    if (currentUser && event !== 'TOKEN_REFRESHED') {
      setCachedData(SESSION_CACHE_KEY, currentUser);
      await fetchProfile(currentUser.id, event === 'SIGNED_IN');
    } else if (!currentUser) {
      setProfile(null);
      // Clear caches on sign out
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESSION_CACHE_KEY);
        sessionStorage.removeItem(PROFILE_CACHE_KEY);
      }
    }

    if (!initialLoad) {
      setLoading(false);
    }
  }, [fetchProfile, initialLoad]);

  // Initialize auth on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      await initializeAuth();
      
      if (!mounted) return;

      // Set up auth listener
      const supabase = getSupabase();
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [initializeAuth, handleAuthChange]);

  // Sign out function
  const signOut = useCallback(async (): Promise<void> => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      setUser(null);
      setProfile(null);
      
      // Clear all caches
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESSION_CACHE_KEY);
        sessionStorage.removeItem(PROFILE_CACHE_KEY);
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }, []);

  // Refresh profile function
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (user) {
      await fetchProfile(user.id, false);
    }
  }, [user, fetchProfile]);

  // Memoized computed values
  const authState = useMemo((): OptimizedAuthState => ({
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isCreator: profile?.is_creator || false,
    isSeller: profile?.is_seller || false,
    signOut,
    refreshProfile,
  }), [user, profile, loading, signOut, refreshProfile]);

  return authState;
};

