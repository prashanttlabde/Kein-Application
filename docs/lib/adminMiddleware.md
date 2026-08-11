# Admin Middleware Documentation

React hooks and higher-order components for admin authentication and route protection.

## Overview

**Files**: 
- `lib/adminMiddleware.ts` - Authentication hook
- `lib/adminMiddleware.tsx` - Higher-order component with JSX  
**Type**: Client-side authentication utilities  
**Purpose**: Provide React hooks and HOCs for admin authentication state management  

## Exports

### useAdminAuth Hook

```typescript
interface AdminAuthState {
  user: AdminUser | null;
  profile: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
}

export const useAdminAuth = (): AdminAuthState
```

**Purpose**: React hook for managing admin authentication state  
**Returns**: Current admin authentication state with user data and loading status  

#### State Properties

- **user**: Current admin user object or null
- **profile**: Admin profile data (same as user for consistency)
- **loading**: Boolean indicating if authentication check is in progress
- **isAdmin**: Boolean indicating if user has valid admin session

#### Authentication Flow

1. **Initial Load**: Sets loading to true, checks existing admin session
2. **Session Validation**: Calls `adminAuth.isAdmin()` to verify session
3. **User Data Fetch**: If valid session, fetches admin user data
4. **Redirect Handling**: Automatically redirects to `/admin/login` if not authenticated
5. **State Update**: Updates authentication state with results

#### Usage Example

```typescript
// In admin components
const AdminDashboard = () => {
  const { user, profile, loading, isAdmin } = useAdminAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return null; // Will redirect to login
  }

  return (
    <div>
      <h1>Welcome, {profile?.full_name}</h1>
      {/* Admin dashboard content */}
    </div>
  );
};
```

### withAdminAuth HOC

```typescript
export const withAdminAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => React.ComponentType<P>
```

**Purpose**: Higher-order component for protecting admin routes  
**Parameters**: React component to wrap with admin authentication  
**Returns**: Enhanced component with authentication protection  

#### Features

- **Automatic Protection**: Wraps components with authentication checks
- **Loading State**: Shows loading spinner during authentication verification
- **Redirect Handling**: Automatically redirects unauthenticated users
- **Props Forwarding**: Passes all props through to wrapped component
- **Display Name**: Preserves component names for debugging

#### Usage Example

```typescript
// Protect admin components
const AdminUsersPage = () => {
  return (
    <div>
      <h1>User Management</h1>
      {/* Admin users content */}
    </div>
  );
};

export default withAdminAuth(AdminUsersPage);
```

#### Alternative Usage Pattern

```typescript
// As decorator
@withAdminAuth
class AdminComponent extends React.Component {
  render() {
    return <div>Protected admin content</div>;
  }
}

// Or inline
const ProtectedComponent = withAdminAuth(({ data }) => (
  <div>Admin content with {data}</div>
));
```

## Authentication Logic

### Session Validation Process

```typescript
const checkAdminAuth = async () => {
  try {
    // Check if valid admin session exists
    const isAdmin = await adminAuth.isAdmin();
    
    if (!isAdmin) {
      // Redirect to login and clear state
      router.push('/admin/login');
      setAuthState({ /* cleared state */ });
      return;
    }

    // Fetch current admin user data
    const { user, profile } = await adminAuth.getAdminUser();
    
    if (!user || !profile) {
      // Handle missing user data
      router.push('/admin/login');
      setAuthState({ /* cleared state */ });
      return;
    }

    // Set authenticated state
    setAuthState({
      user,
      profile,
      loading: false,
      isAdmin: true
    });
  } catch (error) {
    // Handle authentication errors
    console.error('Admin auth check failed:', error);
    router.push('/admin/login');
    setAuthState({ /* error state */ });
  }
};
```

### Error Handling

**Network Errors**: Graceful handling of network connectivity issues  
**Session Expiry**: Automatic detection and handling of expired sessions  
**Invalid Data**: Proper handling of corrupted or invalid session data  
**Redirect Safety**: Prevents infinite redirect loops  

## Loading States

### Loading Spinner Component

```typescript
// Built-in loading state
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
    <p className="mt-4 text-gray-600">Verifying admin access...</p>
  </div>
</div>
```

**Features**:
- Full-screen loading overlay
- Animated spinner with brand colors
- Descriptive loading message
- Responsive design

### Custom Loading States

```typescript
// Custom loading component
const CustomAdminLoader = () => {
  const { loading } = useAdminAuth();
  
  if (loading) {
    return <CustomSpinner message="Checking admin permissions..." />;
  }
  
  return null;
};
```

## Integration with Admin Auth

### Dependencies

- **adminAuth.isAdmin()**: Session validation
- **adminAuth.getAdminUser()**: User data retrieval
- **Next.js Router**: Navigation and redirects

### State Synchronization

```typescript
// Automatic state updates when auth changes
useEffect(() => {
  checkAdminAuth();
}, [router]); // Re-check on router changes

// Manual refresh capability
const refreshAuth = useCallback(async () => {
  await checkAdminAuth();
}, []);
```

## Route Protection Patterns

### Page-Level Protection

```typescript
// Protect entire pages
const AdminPortalPage = () => {
  const { loading, isAdmin } = useAdminAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!isAdmin) return null;
  
  return <AdminPortalContent />;
};
```

### Layout-Level Protection

```typescript
// Protect admin layouts
const AdminLayout = ({ children }) => {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
};

const AdminAuthProvider = ({ children }) => {
  const { loading, isAdmin } = useAdminAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!isAdmin) return null;
  
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main>{children}</main>
    </div>
  );
};
```

### Component-Level Protection

```typescript
// Protect specific components
const AdminOnlyButton = withAdminAuth(({ onClick, children }) => (
  <button onClick={onClick} className="admin-button">
    {children}
  </button>
));
```

## Performance Considerations

### Optimization Strategies

**Memoization**: Use React.memo for expensive components  
**Callback Stability**: useCallback for event handlers  
**State Batching**: Batch state updates to prevent unnecessary re-renders  
**Conditional Rendering**: Early returns to avoid expensive computations  

### Bundle Size

**Tree Shaking**: Only import necessary admin auth functions  
**Code Splitting**: Separate admin components from main bundle  
**Lazy Loading**: Load admin components only when needed  

## Security Features

### Session Security

- **Automatic Expiry**: 24-hour session timeout
- **Validation**: Continuous session validity checking
- **Cleanup**: Automatic cleanup of invalid sessions
- **Redirect Protection**: Secure redirect handling

### Data Protection

- **State Isolation**: Admin state separate from user state
- **Memory Cleanup**: Proper cleanup on component unmount
- **Error Boundaries**: Graceful error handling
- **Input Validation**: Validate all authentication inputs

## Testing

### Unit Tests

```typescript
// Test authentication hook
describe('useAdminAuth', () => {
  it('should return loading state initially', () => {
    const { result } = renderHook(() => useAdminAuth());
    expect(result.current.loading).toBe(true);
  });

  it('should redirect on invalid session', async () => {
    // Mock invalid session
    jest.spyOn(adminAuth, 'isAdmin').mockResolvedValue(false);
    
    renderHook(() => useAdminAuth());
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/login');
    });
  });
});
```

### Integration Tests

```typescript
// Test HOC protection
describe('withAdminAuth', () => {
  it('should render component for authenticated admin', async () => {
    const TestComponent = () => <div>Admin Content</div>;
    const ProtectedComponent = withAdminAuth(TestComponent);
    
    // Mock authenticated state
    jest.spyOn(adminAuth, 'isAdmin').mockResolvedValue(true);
    
    render(<ProtectedComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });
});
```

## Troubleshooting

### Common Issues

**Infinite Redirects**: Check for circular redirect logic  
**Session Not Persisting**: Verify localStorage functionality  
**Loading Never Ends**: Check for unhandled promise rejections  
**Props Not Forwarding**: Ensure HOC properly spreads props  

### Debug Helpers

```typescript
// Debug authentication state
const DebugAdminAuth = () => {
  const authState = useAdminAuth();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Admin Auth State:', authState);
  }
  
  return null;
};
```

## Future Enhancements

### Planned Features

- **Role-based Access**: Granular admin role permissions
- **Session Management**: Admin session monitoring and control
- **Audit Logging**: Track admin authentication events
- **Multi-factor Auth**: Enhanced security with 2FA integration

### Performance Improvements

- **State Persistence**: Persist auth state across page reloads
- **Background Refresh**: Automatic token refresh in background
- **Optimistic Updates**: Optimistic UI updates for better UX
- **Caching**: Cache admin user data with appropriate TTL