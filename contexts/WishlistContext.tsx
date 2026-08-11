'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSupabase } from '@/lib/supabase';

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
};

interface WishlistItem {
  id: string;
  added_at: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    images: string[];
    category: string;
    is_active: boolean;
    stock_quantity: number;
    seller: {
      id: string;
      full_name: string;
      username: string;
    };
  };
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  loading: boolean;
  error: string | null;
  addToWishlist: (product_id: string) => Promise<{ success: boolean; message: string }>;
  removeFromWishlist: (product_id: string) => Promise<void>;
  fetchWishlistItems: () => Promise<void>;
  isInWishlist: (product_id: string) => boolean;
  toggleWishlist: (product_id: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchWishlistItems = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!user) {
      setWishlistItems([]);
      setHasFetched(false);
      return;
    }

    // Don't fetch if already fetching or already fetched for this user
    if (loading || hasFetched) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/wishlist', {
        headers,
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setWishlistItems([]);
          setHasFetched(false);
          return;
        }
        throw new Error(data.error || 'Failed to fetch wishlist items');
      }

      setWishlistItems(data.wishlist || []);
      setHasFetched(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wishlist items';
      setError(errorMessage);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, loading, hasFetched]);

  const addToWishlist = useCallback(async (product_id: string) => {
    if (!user) {
      throw new Error('User must be authenticated to add items to wishlist');
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ product_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item to wishlist');
      }

      // Refresh wishlist
      setHasFetched(false);
      await fetchWishlistItems();

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to wishlist';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, fetchWishlistItems]);

  const removeFromWishlist = useCallback(async (product_id: string) => {
    if (!user) {
      throw new Error('User must be authenticated to remove items from wishlist');
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/wishlist?product_id=${product_id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove item from wishlist');
      }

      // Update local state
      setWishlistItems(prev => prev.filter(item => item.product.id !== product_id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from wishlist';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const isInWishlist = useCallback((product_id: string) => {
    return wishlistItems.some(item => item.product.id === product_id);
  }, [wishlistItems]);

  const toggleWishlist = useCallback(async (product_id: string) => {
    const inWishlist = isInWishlist(product_id);
    
    if (inWishlist) {
      await removeFromWishlist(product_id);
    } else {
      await addToWishlist(product_id);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  // Auto-fetch when user logs in (only once)
  useEffect(() => {
    if (user && !hasFetched) {
      fetchWishlistItems();
    } else if (!user) {
      setWishlistItems([]);
      setHasFetched(false);
    }
  }, [user, hasFetched, fetchWishlistItems]);

  const value = {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    fetchWishlistItems,
    isInWishlist,
    toggleWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
}
