# Admin Authentication Module Documentation

Secure authentication system for platform administrators with multi-factor authentication and enhanced security features.

## Overview

**File**: `lib/adminAuth.ts`  
**Purpose**: Independent admin authentication system separate from regular users  
**Security**: Multi-factor authentication (email + password + security key)  
**Session**: 24-hour localStorage-based sessions with automatic timeout  

## Interface Definition

```typescript
interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  security_key: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}
```

## Core Functions

### signIn
```typescript
signIn: async (email: string, password: string, securityKey: string) => {
  // Triple authentication validation
  // Session creation and storage
  // Last login timestamp update
  return { data: { user, session }, error: null };
}
```

**Purpose**: Authenticate admin user with triple verification  
**Parameters**:
- `email` - Admin email address
- `password` - Admin password
- `securityKey` - Unique security key for additional verification

**Returns**: `{ data: { user: AdminUser, session: AdminSession } | null, error: Error | null }`

**Security Features**:
- Email and security key validation against database
- Password verification (currently hardcoded, should use proper hashing)
- Input trimming to prevent whitespace issues
- Comprehensive error logging
- Session token generation

**Authentication Flow**:
1. Trim and validate input parameters
2. Query database for matching admin user
3. Verify email and security key combination
4. Validate password against expected value
5. Update last login timestamp
6. Create and store session in localStorage
7. Return user data and session token

### isAdmin
```typescript
isAdmin: async () => {
  // Session validation
  // Timeout checking (24 hours)
  // Database verification
  return boolean;
}
```

**Purpose**: Check if current user has valid admin session  
**Returns**: `boolean` - True if valid admin session exists  

**Validation Process**:
1. Check for existing localStorage session
2. Validate session timestamp (24-hour timeout)
3. Verify admin user still exists and is active
4. Clean up expired sessions automatically

### getAdminUser
```typescript
getAdminUser: async () => {
  // Session retrieval and validation
  // Fresh admin data fetching
  return { user: AdminUser | null, profile: AdminUser | null };
}
```

**Purpose**: Retrieve current admin user data  
**Returns**: `{ user: AdminUser | null, profile: AdminUser | null }`  

**Features**:
- Session validation before data retrieval
- Fresh data fetching from database
- Automatic session cleanup for invalid sessions
- Consistent return format for user and profile

### signOut
```typescript
signOut: async () => {
  // Session cleanup
  // localStorage removal
  return { error: null };
}
```

**Purpose**: Securely sign out admin user  
**Returns**: `{ error: Error | null }`  

**Security**:
- Complete localStorage session removal
- Client-side session cleanup
- Error handling for cleanup failures

## Admin Management Functions

### getAllAdmins
```typescript
getAllAdmins: async () => {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, full_name, is_active, last_login, created_at')
    .order('created_at', { ascending: false });
  return { data, error };
}
```

**Purpose**: Retrieve all admin users for management  
**Returns**: `{ data: AdminUser[] | null, error: Error | null }`  
**Usage**: Admin user management, audit purposes  

### updateAdminStatus
```typescript
updateAdminStatus: async (adminId: string, isActive: boolean) => {
  const { data, error } = await supabase
    .from('admin_users')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', adminId)
    .select()
    .single();
  return { data, error };
}
```

**Purpose**: Enable/disable admin user accounts  
**Parameters**: `adminId` - Admin UUID, `isActive` - Active status  
**Returns**: `{ data: AdminUser | null, error: Error | null }`  
**Usage**: Admin account management, security control  

## Security Features

### Multi-Factor Authentication
1. **Email Verification**: Must match registered admin email
2. **Password Authentication**: Secure password validation
3. **Security Key**: Unique key for additional verification layer

### Session Management
- **Duration**: 24-hour session timeout
- **Storage**: localStorage for client-side persistence
- **Validation**: Continuous session validity checking
- **Cleanup**: Automatic expired session removal

### Database Security
- **Separate Table**: Independent `admin_users` table
- **Active Status**: Account enable/disable functionality
- **Audit Trail**: Last login tracking and timestamps
- **Input Validation**: Comprehensive input sanitization

## Pre-configured Admin Accounts

### Admin Account 1
```
Email: admin1@kein.com
Password: KeinAdmin2024!
Security Key: KEIN_ADMIN_2024_SECURE_KEY_001
```

### Admin Account 2
```
Email: admin2@kein.com
Password: KeinAdmin2024!
Security Key: KEIN_ADMIN_2024_SECURE_KEY_002
```

**Note**: These are development accounts. In production, passwords should be properly hashed and security keys should be environment variables.

## Error Handling

### Authentication Errors
- **Invalid Credentials**: Clear error messages for wrong email/password
- **Invalid Security Key**: Specific error for security key mismatch
- **Database Errors**: Comprehensive database error handling
- **Session Errors**: Proper session validation error handling

### Error Logging
```typescript
try {
  // Authentication logic
} catch (error) {
  console.error('Admin auth error:', error);
  return { 
    data: null, 
    error: error instanceof Error ? error : new Error('Authentication failed') 
  };
}
```

## Session Structure

### localStorage Session
```typescript
{
  id: string;           // Admin user ID
  email: string;        // Admin email
  full_name: string;    // Admin display name
  loginTime: string;    // ISO timestamp of login
}
```

### Session Validation
- **Timeout Check**: 24-hour maximum session duration
- **Database Verification**: Ensure admin still exists and is active
- **Automatic Cleanup**: Remove expired or invalid sessions

## Usage Examples

### Admin Login Flow
```typescript
// Admin login component
const handleLogin = async (email: string, password: string, securityKey: string) => {
  const { data, error } = await adminAuth.signIn(email, password, securityKey);
  
  if (error) {
    setError(error.message);
    return;
  }
  
  // Redirect to admin portal
  router.push('/admin-portal');
};
```

### Route Protection
```typescript
// Admin route middleware
const checkAdminAuth = async () => {
  const isAdmin = await adminAuth.isAdmin();
  
  if (!isAdmin) {
    redirect('/admin/login');
    return;
  }
  
  // Continue with admin route
};
```

### Admin User Display
```typescript
// Admin header component
const { user, profile } = await adminAuth.getAdminUser();

return (
  <div>
    <span>{profile?.full_name || 'Admin User'}</span>
    <span>{profile?.email}</span>
  </div>
);
```

## Security Considerations

### Production Deployment
1. **Password Hashing**: Implement proper password hashing (bcrypt, Argon2)
2. **Environment Variables**: Move security keys to environment variables
3. **Key Rotation**: Implement regular security key rotation
4. **Rate Limiting**: Add rate limiting to prevent brute force attacks
5. **IP Whitelisting**: Consider restricting admin access by IP address
6. **2FA Enhancement**: Add TOTP-based two-factor authentication

### Audit and Monitoring
1. **Login Attempts**: Log all authentication attempts
2. **Session Tracking**: Monitor active admin sessions
3. **Action Logging**: Log all admin actions for audit trail
4. **Security Alerts**: Alert on suspicious admin activity

### Data Protection
1. **Secure Storage**: Encrypt sensitive data at rest
2. **Secure Transmission**: Ensure HTTPS for all admin communications
3. **Session Security**: Implement secure session tokens
4. **Data Minimization**: Store only necessary admin data

## Performance Optimization

### Caching Strategy
- **Session Caching**: Cache valid sessions to reduce database queries
- **Admin Data Caching**: Cache admin profile data with appropriate TTL
- **Query Optimization**: Optimize admin user queries

### Network Optimization
- **Minimal Requests**: Reduce authentication-related network requests
- **Batch Operations**: Batch admin management operations
- **Connection Reuse**: Reuse database connections efficiently

## Future Enhancements

### Planned Security Features
1. **TOTP 2FA**: Time-based one-time password authentication
2. **Hardware Keys**: Support for hardware security keys (WebAuthn)
3. **Biometric Auth**: Fingerprint/face recognition for supported devices
4. **Risk-based Auth**: Adaptive authentication based on risk factors

### Management Features
1. **Admin Roles**: Granular admin role and permission system
2. **Session Management**: Admin session monitoring and control
3. **Audit Dashboard**: Comprehensive admin activity dashboard
4. **Bulk Operations**: Bulk admin user management operations

### Integration Improvements
1. **SSO Integration**: Single sign-on with enterprise systems
2. **LDAP/AD**: Active Directory integration for enterprise
3. **API Keys**: API key management for admin operations
4. **Webhook Integration**: Admin action webhooks for external systems