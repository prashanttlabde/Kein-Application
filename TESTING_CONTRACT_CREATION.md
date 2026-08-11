# Testing Contract Creation Flow

## Quick Test Steps

### 1. Prerequisites
- Ensure you're logged in as a seller
- Ensure you have at least one product created
- Have a creator ID ready (get it from the creators page)

### 2. Test the Fix

#### Option A: Direct URL Test
```
http://localhost:3000/seller-dashboard/contracts/create?creator=<CREATOR_ID>
```

Replace `<CREATOR_ID>` with an actual creator's user ID from your database.

#### Option B: Navigate Through UI
1. Go to Seller Dashboard
2. Click "Contracts" in sidebar
3. Click "Create Contract" button
4. Select a creator from the browse list

### 3. Expected Results ✅

When the page loads, you should see:
- ✅ No console errors
- ✅ Creator card appears with:
  - Creator avatar/profile picture
  - Full name
  - Username (with @)
  - Follower count (formatted as K)
  - Engagement rate percentage
- ✅ Products list loads
- ✅ You can select/deselect products
- ✅ Commission rate slider works
- ✅ Contract can be submitted

### 4. What Was Fixed

**Before:**
```
❌ Error: Failed to fetch creator data
❌ API endpoint /api/creators/[id] returned 404
❌ Contract creation page stuck loading
```

**After:**
```
✅ API endpoint /api/creators/[id] returns creator data
✅ Creator card displays correctly
✅ Contract creation works end-to-end
```

### 5. API Endpoint Test

You can test the API directly in browser or Postman:

```
GET http://localhost:3000/api/creators/<CREATOR_ID>
```

**Expected Response:**
```json
{
  "data": {
    "id": "uuid-here",
    "full_name": "Creator Name",
    "username": "creatorusername",
    "avatar_url": "https://...",
    "followers_count": 1500,
    "following_count": 300,
    "engagement_rate": 4.2,
    "is_creator": true,
    "creator_verified": true
  }
}
```

### 6. Troubleshooting

#### Issue: "Creator not found"
**Cause:** Invalid creator ID or user doesn't exist
**Fix:** 
1. Check the database `profiles` table
2. Verify the user ID is correct
3. Ensure the user has `is_creator: true`

#### Issue: "User is not a creator"
**Cause:** The user exists but is not marked as a creator
**Fix:** Update the user profile in database:
```sql
UPDATE profiles 
SET is_creator = true, creator_verified = true 
WHERE id = '<USER_ID>';
```

#### Issue: Still getting 404
**Cause:** Dev server needs restart
**Fix:** 
1. Stop the dev server (Ctrl+C in terminal)
2. Restart with `npm run dev`
3. Wait for compilation to complete
4. Try again

### 7. Database Query to Find Creators

If you need to find creator IDs in your database:

```sql
SELECT id, full_name, username, followers_count, is_creator, creator_verified
FROM profiles
WHERE is_creator = true
ORDER BY followers_count DESC
LIMIT 10;
```

### 8. Test Contract Submission

After selecting creator and products:
1. Adjust commission rate (default 15%)
2. Add contract terms (optional)
3. Click "Send Proposal"
4. Should redirect to `/seller-dashboard/contracts`
5. Check database `contracts` table for new entry

### 9. Success Indicators

✅ Page loads without errors
✅ Creator data displays
✅ Products are selectable
✅ Form submission works
✅ Success message appears
✅ Redirects to contracts list

### 10. Common Test Data

If you need to create test data, here are the required fields:

**Creator Profile:**
- id: UUID
- full_name: "Test Creator"
- username: "testcreator"
- email: "creator@test.com"
- is_creator: true
- creator_verified: true
- followers_count: 1000+ (optional)

**Seller Profile:**
- id: UUID
- full_name: "Test Seller"
- username: "testseller"
- email: "seller@test.com"
- is_seller: true
- seller_verified: true

**Product:**
- id: UUID
- seller_id: (seller's user id)
- name: "Test Product"
- price: 2999 (in cents)
- is_active: true
- stock_quantity: 10+
