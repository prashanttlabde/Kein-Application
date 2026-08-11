'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
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

interface CartItem {
  id: string;
  quantity: number;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
    stock_quantity: number;
    is_active: boolean;
  };
}

interface AddToCartParams {
  product_id: string;
  quantity?: number;
  reel_id?: string;
}

export const useCart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCallback(async ({ product_id, quantity = 1, reel_id }: AddToCartParams) => {
    if (!user) {
      throw new Error('Please sign in to add items to your cart');
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,
          product_id,
          quantity,
          reel_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to add items to your cart');
        }
        throw new Error(data.error || 'Failed to add item to cart');
      }

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeFromCart = useCallback(async (cart_item_id: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/cart?cart_item_id=${cart_item_id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to manage your cart');
        }
        throw new Error(data.error || 'Failed to remove item from cart');
      }

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateCartItemQuantity = useCallback(async (cart_item_id: string, quantity: number) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          cart_item_id,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to update your cart');
        }
        throw new Error(data.error || 'Failed to update cart item');
      }

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cart item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchCartItems = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/cart', {
        headers,
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated, clear cart
          setCartItems([]);
          return;
        }
        throw new Error(data.error || 'Failed to fetch cart items');
      }

      setCartItems(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cart items';
      setError(errorMessage);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.products.price * item.quantity), 0);
  }, [cartItems]);

  const isInCart = useCallback((productId: string) => {
    return cartItems.some(item => item.products.id === productId);
  }, [cartItems]);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    fetchCartItems,
    getCartItemCount,
    getCartTotal,
    isInCart,
  };
};
