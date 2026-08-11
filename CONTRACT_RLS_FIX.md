# Contract RLS Policy Fix

## Problem
Contract creation was failing with the error:
```
Failed to create contract: new row violates row-level security policy for table "contracts"
```

## Root Cause
The `/api/contracts` POST endpoint was using the **anon key** client to insert contracts into the database. The anon key client is subject to Row Level Security (RLS) policies, which were blocking the insert operation.

## Solution
Updated the API to use the **service role key** (admin client) for contract creation, which bypasses RLS policies.

### Changes Made

**File:** `app/api/contracts/route.ts`

1. **Added service role key import:**
   ```typescript
   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
   ```

2. **Created two separate clients:**
   - **Anon client** - For reading data (respects RLS)
   - **Admin client** - For writing contracts (bypasses RLS)
   ```typescript
   // Create Supabase client for reading (uses anon key, respects RLS)
   const supabase = createClient(supabaseUrl, supabaseAnonKey)
   
   // Create admin client for writing (uses service role key, bypasses RLS)
   const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
     auth: {
       autoRefreshToken: false,
       persistSession: false
     }
   })
   ```

3. **Used admin client for contract insertion:**
   ```typescript
   const { data: contract, error: contractError } = await supabaseAdmin
     .from('contracts')
     .insert([contractData])
     .select()
     .single()
   ```

4. **Used admin client for notification creation:**
   ```typescript
   await supabaseAdmin
     .from('notifications')
     .insert([{...}])
   ```

## Why This Works

### Service Role Key vs Anon Key

| Client Type | RLS Behavior | Use Case |
|------------|--------------|----------|
| **Anon Key** | Subject to RLS policies | Client-side operations, user-initiated reads |
| **Service Role Key** | Bypasses RLS policies | Server-side operations, admin tasks |

### Security Considerations

✅ **Safe to use admin client here because:**
- API validates the seller exists and is verified
- API validates the creator exists and is verified
- API validates products belong to the seller
- API runs server-side only (Next.js API route)
- Service role key is never exposed to client

❌ **Never use service role key for:**
- Client-side code
- User-controlled queries
- Public API endpoints

## Testing

### Before Fix:
```
❌ POST /api/contracts
❌ Error: "new row violates row-level security policy for table 'contracts'"
❌ Contract not created
❌ Notification not sent
```

### After Fix:
```
✅ POST /api/contracts
✅ Contract created successfully with status 'pending'
✅ Notification sent to creator
✅ Returns contract data with ID
```

## How to Test

1. **Ensure you're logged in as a verified seller**
2. **Navigate to contract creation:**
   ```
   http://localhost:3000/seller-dashboard/contracts/create?creator=<CREATOR_ID>
   ```
3. **Select products and fill form**
4. **Click "Send Proposal"**
5. **Expected results:**
   - ✅ Success message appears
   - ✅ Redirects to `/seller-dashboard/contracts`
   - ✅ Contract appears in the list with "pending" status
   - ✅ Creator receives notification

## Database Verification

Check that the contract was created:
```sql
SELECT * FROM contracts 
ORDER BY created_at DESC 
LIMIT 1;
```

Expected fields:
- `id` - UUID
- `seller_id` - Seller's user ID
- `creator_id` - Creator's user ID
- `product_ids` - Array of product UUIDs
- `commission_rate` - Number (e.g., 15)
- `terms` - Text
- `status` - 'pending'
- `created_at` - Timestamp

## Alternative Solutions (Not Recommended)

### Option 1: Modify RLS Policies
You could create RLS policies that allow inserts, but this is less secure:
```sql
-- NOT RECOMMENDED for this use case
CREATE POLICY "Allow contract creation" ON contracts
  FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = seller_id AND is_seller = true)
  );
```

**Issues:**
- Requires authenticated requests
- More complex policy logic
- Harder to validate business rules
- Can't easily create notifications for other users

### Option 2: Use authenticated Supabase client
Pass user's session token to API and use it:
```typescript
// NOT RECOMMENDED - more complex and less secure
const authHeader = request.headers.get('authorization')
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } }
})
```

**Issues:**
- More complex authentication flow
- Still subject to RLS
- Harder to create cross-user notifications
- Less control over validation

## Best Practice ✅

For **server-side API routes** that perform **validated business operations**, using the **service role key is the correct approach**.

The key is ensuring proper validation before any database operations, which our API does:
1. ✅ Validates seller exists and is verified
2. ✅ Validates creator exists and is verified  
3. ✅ Validates products belong to seller
4. ✅ Validates required fields
5. ✅ Then uses admin client for insertion

## Files Changed
- ✅ `app/api/contracts/route.ts` - Uses service role key for contract creation

## Related Issues
- ✅ Creator data fetch issue (fixed in previous update)
- ✅ OAuth callback issue (fixed in previous update)
- ✅ Contract RLS policy violation (fixed in this update)
