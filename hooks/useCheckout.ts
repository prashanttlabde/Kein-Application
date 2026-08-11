'use client';

import { useState } from 'react';
import { useAuth } from './useAuth';
import { getSupabase } from '@/lib/supabase';

interface Address {
  full_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface CheckoutData {
  shipping_address: Address;
  billing_address?: Address;
  payment_method: string;
  notes?: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export const useCheckout = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const placeOrder = async (checkoutData: CheckoutData): Promise<Order> => {
    if (!user) {
      throw new Error('User must be authenticated to place an order');
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,
          ...checkoutData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      return data.order;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getOrders = async () => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/orders', {
        headers,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      return data.orders;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    placeOrder,
    getOrders,
  };
};
