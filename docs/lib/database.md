# Database Module Documentation

Comprehensive database operations module providing type-safe access to all Kein platform data.

## Overview

**File**: `lib/database.ts`  
**Purpose**: Centralized database operations with type safety and error handling  
**Database**: Supabase PostgreSQL with Row Level Security (RLS)  

## Type Definitions

### Core Interfaces

```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  website?: string;
  role: 'user' | 'admin';
  is_influencer: boolean;
  is_seller: boolean;
  influencer_verified: boolean;
  seller_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface VerificationRequest {
  id: string;
  user_id: string;
  type: 'influencer' | 'seller';
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
  business_name?: string;
  business_type?: string;
  tax_id?: string;
  bank_details?: Record<string, unknown>;
  social_links?: string[];
  follower_count?: number;
  additional_info?: Record<string, unknown>;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  seller_id: string;
  is_active: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

interface Contract {
  id: string;
  seller_id: string;
  influencer_id: string;
  product_ids: string[];
  commission_rate: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  terms: string;
  created_at: string;
  updated_at: string;
}
```

## User Profile Operations

### getUserProfile
```typescript
getUserProfile: async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}
```

**Purpose**: Retrieve a single user profile by ID  
**Parameters**: `userId` - User UUID  
**Returns**: `{ data: UserProfile | null, error: Error | null }`  
**Usage**: Profile pages, user management  

### createUserProfile
```typescript
createUserProfile: async (profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile])
    .select()
    .single()
  return { data, error }
}
```

**Purpose**: Create a new user profile  
**Parameters**: `profile` - Partial user profile data  
**Returns**: `{ data: UserProfile | null, error: Error | null }`  
**Usage**: User registration, profile creation  

### updateUserProfile
```typescript
updateUserProfile: async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}
```

**Purpose**: Update existing user profile  
**Parameters**: `userId` - User UUID, `updates` - Profile updates  
**Returns**: `{ data: UserProfile | null, error: Error | null }`  
**Usage**: Profile editing, role updates  

## Verification Operations

### createVerificationRequest
```typescript
createVerificationRequest: async (request: Partial<VerificationRequest>) => {
  const { data, error } = await supabase
    .from('verification_requests')
    .insert([request])
    .select()
    .single()
  return { data, error }
}
```

**Purpose**: Submit new verification application  
**Parameters**: `request` - Verification request data  
**Returns**: `{ data: VerificationRequest | null, error: Error | null }`  
**Usage**: Influencer/seller verification applications  

### getVerificationRequests
```typescript
getVerificationRequests: async (status?: string) => {
  let query = supabase
    .from('verification_requests')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        username
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  return { data, error }
}
```

**Purpose**: Retrieve verification requests with user profiles  
**Parameters**: `status` - Optional status filter  
**Returns**: `{ data: VerificationRequestWithProfile[] | null, error: Error | null }`  
**Usage**: Admin verification management  

### updateVerificationRequest
```typescript
updateVerificationRequest: async (id: string, updates: Partial<VerificationRequest>) => {
  const { data, error } = await supabase
    .from('verification_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}
```

**Purpose**: Update verification request status  
**Parameters**: `id` - Request UUID, `updates` - Status updates  
**Returns**: `{ data: VerificationRequest | null, error: Error | null }`  
**Usage**: Admin approval/rejection workflow  

## Product Operations

### getProducts
```typescript
getProducts: async (sellerId?: string) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      profiles:seller_id (
        full_name,
        username
      )
    `)
    .eq('is_active', true)

  if (sellerId) {
    query = query.eq('seller_id', sellerId)
  }

  const { data, error } = await query
  return { data, error }
}
```

**Purpose**: Retrieve products with seller information  
**Parameters**: `sellerId` - Optional seller filter  
**Returns**: `{ data: Product[] | null, error: Error | null }`  
**Usage**: Product catalog, seller dashboard  

### createProduct
```typescript
createProduct: async (product: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()
  return { data, error }
}
```

**Purpose**: Create new product listing  
**Parameters**: `product` - Product data  
**Returns**: `{ data: Product | null, error: Error | null }`  
**Usage**: Seller product creation  

## Contract Operations

### getContracts
```typescript
getContracts: async (userId?: string, role?: 'seller' | 'influencer') => {
  let query = supabase
    .from('contracts')
    .select(`
      *,
      seller:seller_id (
        full_name,
        username,
        avatar_url
      ),
      influencer:influencer_id (
        full_name,
        username,
        avatar_url
      )
    `)

  if (userId && role === 'seller') {
    query = query.eq('seller_id', userId)
  } else if (userId && role === 'influencer') {
    query = query.eq('influencer_id', userId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  return { data, error }
}
```

**Purpose**: Retrieve contracts with party information  
**Parameters**: `userId` - Optional user filter, `role` - User role filter  
**Returns**: `{ data: Contract[] | null, error: Error | null }`  
**Usage**: Contract management, partnership tracking  

## Admin Operations

### getAllUsers
```typescript
getAllUsers: async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}
```

**Purpose**: Retrieve all user profiles for admin management  
**Returns**: `{ data: UserProfile[] | null, error: Error | null }`  
**Usage**: Admin user management  

### adminGetVerificationRequests
```typescript
adminGetVerificationRequests: async (status?: string) => {
  if (!supabaseAdmin) {
    return { data: null, error: new Error('Admin client not configured') }
  }

  let query = supabaseAdmin
    .from('verification_requests')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        username
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  return { data, error: null }
}
```

**Purpose**: Admin-only verification request access (bypasses RLS)  
**Parameters**: `status` - Optional status filter  
**Returns**: `{ data: VerificationRequestWithProfile[] | null, error: Error | null }`  
**Usage**: Admin verification management  

### adminProcessVerification
```typescript
adminProcessVerification: async (
  requestId: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
) => {
  // Update verification request
  const { data: request, error: requestError } = await database.adminUpdateVerificationRequest(requestId, {
    status,
    admin_notes: adminNotes,
    updated_at: new Date().toISOString()
  })

  if (requestError || !request) {
    return { data: request, error: requestError }
  }

  // If approved, update user profile
  if (status === 'approved') {
    const updateData: Partial<UserProfile> = {}
    if (request.type === 'influencer') {
      updateData.influencer_verified = true
    } else {
      updateData.seller_verified = true
    }

    // Update user profile with admin client
    if (supabaseAdmin) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', request.user_id)
      
      if (profileError) {
        console.error('Error updating user profile:', profileError)
      }
    }
  }

  return { data: request, error: null }
}
```

**Purpose**: Complete verification approval/rejection workflow  
**Parameters**: `requestId` - Request UUID, `status` - Approval status, `adminNotes` - Optional notes  
**Returns**: `{ data: VerificationRequest | null, error: Error | null }`  
**Usage**: Admin verification processing  

## Analytics Operations

### getAdminStats
```typescript
getAdminStats: async () => {
  // Get user counts
  const { data: users } = await supabase
    .from('profiles')
    .select('role, is_influencer, is_seller, influencer_verified, seller_verified')

  // Calculate comprehensive statistics
  const stats = {
    users: {
      total: users?.length || 0,
      admins: users?.filter(u => u.role === 'admin').length || 0,
      influencers: users?.filter(u => u.is_influencer).length || 0,
      verifiedInfluencers: users?.filter(u => u.is_influencer && u.influencer_verified).length || 0,
      sellers: users?.filter(u => u.is_seller).length || 0,
      verifiedSellers: users?.filter(u => u.is_seller && u.seller_verified).length || 0
    },
    // ... more stats
  }

  return { data: stats, error: null }
}
```

**Purpose**: Generate comprehensive platform analytics  
**Returns**: `{ data: AdminStats | null, error: Error | null }`  
**Usage**: Admin dashboard statistics  

## Error Handling

### Consistent Error Pattern
All database operations follow a consistent error handling pattern:

```typescript
try {
  const { data, error } = await supabaseOperation();
  if (error) throw error;
  return { data, error: null };
} catch (error) {
  console.error('Operation failed:', error);
  return { data: null, error };
}
```

### Error Types
- **Database Errors**: Connection issues, query failures
- **Validation Errors**: Invalid data, constraint violations
- **Permission Errors**: RLS policy violations, unauthorized access
- **Network Errors**: Timeout, connectivity issues

## Security Features

### Row Level Security (RLS)
- **User Profiles**: Users can only access their own profiles
- **Verification Requests**: Users can only see their own requests
- **Products**: Public read, seller write access
- **Contracts**: Party-specific access control

### Admin Operations
- **Service Role Key**: Bypasses RLS for admin operations
- **Separate Client**: `supabaseAdmin` for privileged operations
- **Audit Trail**: Comprehensive logging of admin actions

### Data Validation
- **Type Safety**: TypeScript interfaces for all operations
- **Input Sanitization**: Proper data validation and sanitization
- **SQL Injection Prevention**: Parameterized queries only

## Performance Optimization

### Query Optimization
- **Selective Fields**: Only fetch required fields
- **Proper Indexing**: Database indexes for common queries
- **Join Optimization**: Efficient table joins
- **Pagination**: Large dataset pagination support

### Caching Strategy
- **Client-side Caching**: React Query integration ready
- **Database Caching**: Supabase built-in caching
- **CDN Caching**: Static asset caching

### Connection Management
- **Connection Pooling**: Supabase connection pooling
- **Query Batching**: Batch related operations
- **Lazy Loading**: Load data as needed

## Usage Examples

### User Registration Flow
```typescript
// Create user profile after authentication
const { data: profile, error } = await database.createUserProfile({
  id: user.id,
  email: user.email,
  full_name: userData.fullName,
  role: 'user',
  is_influencer: false,
  is_seller: false,
  influencer_verified: false,
  seller_verified: false
});
```

### Verification Application
```typescript
// Submit influencer verification
const { data: request, error } = await database.createVerificationRequest({
  user_id: user.id,
  type: 'influencer',
  status: 'pending',
  documents: uploadedDocuments,
  business_name: formData.businessName,
  social_links: formData.socialLinks,
  follower_count: formData.followerCount
});
```

### Admin Verification Processing
```typescript
// Approve verification request
const { data: result, error } = await database.adminProcessVerification(
  requestId,
  'approved',
  'Application meets all requirements'
);
```

## Testing Support

### Mock Data Generation
- **Test Users**: Predefined test user profiles
- **Sample Requests**: Mock verification requests
- **Test Products**: Sample product catalog
- **Mock Contracts**: Test partnership data

### Development Utilities
- **Data Seeding**: Populate database with test data
- **Reset Functions**: Clean database state for testing
- **Validation Helpers**: Test data validation functions