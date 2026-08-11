# Google OAuth Callback Fix - Complete Guide

## Problem
Users were getting stuck at `http://localhost:3000/?code=2a500ad7-c37d-44a7-9a1c-79ea540caf40` after signing in with Google OAuth.

## Root Cause
The OAuth callback was hitting the homepage instead of the dedicated `/auth/callback` route, causing the code exchange to fail.

## What We Fixed

### 1. ✅ Supabase Client Configuration (`lib/supabase.ts`)
- Changed `detectSessionInUrl: false` - We now handle OAuth codes manually in the dedicated callback route
- Kept `flowType: 'pkce'` - Using the secure PKCE flow as recommended by Supabase

### 2. ✅ Removed Conflicting OAuthHandler (`app/layout.tsx`)
- Removed the global `OAuthHandler` component that was trying to process OAuth codes on every page
- This was causing conflicts with the dedicated callback route

### 3. ✅ Improved Callback Page (`app/auth/callback/page.tsx`)
- Enhanced error handling with proper user feedback
- Added support for the `next` parameter to redirect users after login
- Added session persistence delay to ensure localStorage is updated
- Added `router.refresh()` to update server components with new session
- Better loading states and error messages

## CRITICAL: Update Supabase Dashboard

You **MUST** update your Supabase project's redirect URLs to include the callback route:

### Step-by-Step Instructions:

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com/project/eafxupeakpgpypxczvxk

2. **Open Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "URL Configuration"

3. **Add Redirect URLs**
   
   Add these URLs to **"Redirect URLs"** section:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

4. **Site URL (should already be set)**
   ```
   http://localhost:3000
   ```

5. **Click "Save"**

### Important Notes:
- **Development**: Use `http://localhost:3000/auth/callback`
- **Production**: Replace with your actual domain (e.g., `https://kein.in/auth/callback`)
- Make sure to add **both** development and production URLs
- The URLs must match EXACTLY (including the protocol: http vs https)

## How It Works Now

1. User clicks "Sign in with Google"
2. Google redirects to: `http://localhost:3000/auth/callback?code=XXXX`
3. The `/auth/callback` page:
   - Extracts the `code` from URL
   - Calls `supabase.auth.exchangeCodeForSession(code)`
   - Stores the session in localStorage
   - Redirects user to home page or the `next` parameter
4. User is now authenticated ✅

## Testing the Fix

1. Clear your browser cache and localStorage:
   ```javascript
   // In browser console:
   localStorage.clear()
   sessionStorage.clear()
   ```

2. Try signing in with Google again

3. You should be redirected to `/auth/callback` (you'll see a loading spinner briefly)

4. Then automatically redirected to the home page, now logged in

## Troubleshooting

### Still getting stuck at `/?code=...`?
- Double-check that you added the redirect URLs in Supabase dashboard
- Clear browser cache and localStorage
- Try in incognito/private mode

### "No authorization code found" error?
- Check that the redirect URL in Supabase matches exactly
- Verify Google OAuth is properly configured in Supabase

### Session not persisting?
- Check browser console for errors
- Verify that cookies and localStorage are enabled
- Check that SUPABASE_URL and SUPABASE_ANON_KEY are correct in `.env.local`

## Files Changed
1. `lib/supabase.ts` - Disabled automatic session detection
2. `app/layout.tsx` - Removed global OAuthHandler
3. `app/auth/callback/page.tsx` - Enhanced callback handling
4. `components/auth/GoogleSignInButton.tsx` - Already correctly configured

## Next Steps
1. ✅ Update Supabase dashboard with redirect URLs (REQUIRED)
2. ✅ Test the OAuth flow
3. ✅ Deploy changes to production
4. ✅ Update production redirect URLs in Supabase when deploying
