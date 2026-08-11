/**
 * EXAMPLE: Migrating an Existing Component to Use Error Handling
 * 
 * This file shows how to upgrade a component from basic error handling
 * to the comprehensive error handling system.
 */

// ========================================
// BEFORE - Basic Error Handling
// ========================================

// 'use client';
// import { useState, useEffect } from 'react';

// export default function UserList() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('/api/users');
//       const data = await response.json();
//       setUsers(data);
//     } catch (err) {
//       setError('Failed to load users');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div className="text-red-500">{error}</div>;

//   return (
//     <div>
//       {users.map(user => (
//         <div key={user.id}>{user.name}</div>
//       ))}
//     </div>
//   );
// }

// ========================================
// AFTER - Comprehensive Error Handling
// ========================================

'use client';

import { useEffect, useState } from 'react';
import { useAsyncError } from '@/hooks/useError';
import { get } from '@/lib/apiClient';
import { ErrorCategory } from '@/lib/errorTracking';
import ErrorBoundary from '@/components/ErrorBoundary';
import { DatabaseError, InlineError } from '@/components/ErrorComponents';

interface User {
  id: string;
  name: string;
  email: string;
}

function UserListContent() {
  const { 
    data: users, 
    loading, 
    error, 
    errorMessage, 
    execute,
    canRetry 
  } = useAsyncError<User[]>();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    await execute(
      // API call with automatic retry
      async () => get<User[]>('/api/users', {
        retry: { maxRetries: 3 },
        context: { 
          action: 'fetch users',
          component: 'UserList' 
        }
      }),
      {
        category: ErrorCategory.API,
      }
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Error state - Full page error for critical failures
  if (error && !canRetry) {
    return (
      <DatabaseError 
        onRetry={loadUsers}
        onGoHome={() => window.location.href = '/'}
      />
    );
  }

  // Error state - Inline error for retryable errors
  if (error && canRetry) {
    return (
      <div className="p-4">
        <InlineError 
          message={errorMessage}
          onDismiss={loadUsers}
        />
      </div>
    );
  }

  // Empty state
  if (!users || users.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No users found
      </div>
    );
  }

  // Success state
  return (
    <div className="space-y-4 p-4">
      {users.map(user => (
        <div 
          key={user.id}
          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
      ))}
    </div>
  );
}

// Wrap with error boundary
export default function UserList() {
  return (
    <ErrorBoundary context="UserList">
      <UserListContent />
    </ErrorBoundary>
  );
}

// ========================================
// EXAMPLE 2: Form with Error Handling
// ========================================

export function UserFormExample() {
  const { execute, loading, errorMessage } = useAsyncError();
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await execute(
      async () => {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create user');
        }
        
        return response.json();
      },
      {
        category: ErrorCategory.API,
        context: {
          action: 'create user',
          component: 'UserForm'
        }
      }
    );

    if (result) {
      alert('User created successfully!');
      setFormData({ name: '', email: '' });
    }
  };

  return (
    <ErrorBoundary context="UserForm">
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {errorMessage && (
          <InlineError message={errorMessage} />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </ErrorBoundary>
  );
}

// ========================================
// EXAMPLE 3: Supabase Query with Retry
// ========================================

import { supabaseQuery } from '@/lib/apiClient';
import { supabase } from '@/lib/supabase';

export function SupabaseExample() {
  const { data: products, loading, error, execute } = useAsyncError();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    await execute(
      async () => supabaseQuery(
        () => supabase!
          .from('products')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false }),
        {
          retry: { maxRetries: 2 },
          context: { action: 'fetch products' },
          errorMessage: 'Unable to load products. Please try again.'
        }
      ),
      {
        category: ErrorCategory.DATABASE
      }
    );
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <DatabaseError onRetry={loadProducts} />;

  return (
    <ErrorBoundary context="ProductList">
      <div className="grid grid-cols-3 gap-4">
        {products?.map((product: any) => (
          <div key={product.id} className="border rounded p-4">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </ErrorBoundary>
  );
}

// ========================================
// EXAMPLE 4: Setting User Context
// ========================================

import { setUserContext, clearUserContext } from '@/lib/errorTracking';

export function AuthExample() {
  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Set user context for error tracking
      if (data.user) {
        setUserContext({
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata?.username,
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    await supabase!.auth.signOut();
    
    // Clear user context
    clearUserContext();
  };

  return null;
}

// ========================================
// KEY IMPROVEMENTS
// ========================================

/**
 * What Changed:
 * 
 * 1. ✅ Error Boundary wrapper for React errors
 * 2. ✅ useAsyncError hook for state management
 * 3. ✅ API client with automatic retry
 * 4. ✅ Proper error categorization
 * 5. ✅ User-friendly error messages
 * 6. ✅ Error context for debugging
 * 7. ✅ Specialized error components
 * 8. ✅ Retry capability for transient failures
 * 9. ✅ Loading and empty states
 * 10. ✅ Automatic error logging to Sentry
 */
