# Authentication Error Fix Guide

## Problem: Invalid Refresh Token Error

If you encounter the error:
```
AuthApiError: Invalid Refresh Token: Refresh Token Not Found
```

This means your browser has corrupted or invalid authentication tokens stored locally.

## Automatic Fix

The application now includes **automatic error handling** that will:
1. Detect invalid refresh token errors
2. Automatically clear corrupted session data
3. Allow you to sign in again without issues

## Manual Fix Options

If you still experience issues, try one of these methods:

### Method 1: Use the Console Utility (Recommended)

1. Open your browser's Developer Console:
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
   - **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - **Safari**: Press `Cmd+Option+C`

2. Type the following command and press Enter:
   ```javascript
   clearSupabaseSession()
   ```

3. The page will automatically refresh with a clean session.

### Method 2: Clear Browser Storage Manually

1. Open Developer Tools (`F12`)
2. Go to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Expand **Local Storage** in the left sidebar
4. Click on your website's URL
5. Delete all keys that start with `sb-` or contain `supabase`
6. Do the same for **Session Storage**
7. Refresh the page

### Method 3: Clear All Browser Data

1. Open browser settings
2. Go to **Privacy and Security**
3. Click **Clear browsing data**
4. Select **Cookies and other site data** and **Cached images and files**
5. Choose **All time** as the time range
6. Click **Clear data**
7. Refresh the page

## Prevention

This error typically occurs when:
- You haven't signed in for a long time (token expired)
- Your authentication token was corrupted
- You cleared cookies but not localStorage
- You signed out on another device

The app now handles these cases automatically, but if you experience persistent issues:
1. Sign out completely
2. Clear your browser cache
3. Sign in again with fresh credentials

## For Developers

The following improvements have been implemented:

### 1. Enhanced Supabase Client Configuration
- Added PKCE flow for better security
- Configured proper storage handling
- Added client identification headers

### 2. AuthContext Error Handling
- Detects invalid refresh token errors
- Automatically clears corrupted sessions
- Handles TOKEN_REFRESHED and SIGNED_OUT events properly
- Logs detailed authentication state changes

### 3. Global Error Handler
- `AuthErrorHandler` component catches unhandled auth errors
- Prevents error spam in console
- Automatically cleans up invalid sessions

### 4. Helper Utilities
- `clearInvalidSession()` - Programmatically clear corrupted sessions
- `validateSession()` - Check if current session is valid
- Console utility for quick manual fixes

### 5. Files Modified
- `/lib/supabase.ts` - Enhanced client configuration
- `/contexts/AuthContext.tsx` - Improved error handling
- `/lib/supabase-helpers.ts` - New utility functions
- `/components/AuthErrorHandler.tsx` - Global error catcher
- `/app/layout.tsx` - Integrated error handler

## Testing

To test the fix:
1. Manually corrupt a token in localStorage
2. Try to navigate the app
3. Verify that the error is caught and session is cleared
4. Check that you can sign in again without issues

## Support

If you continue to experience authentication issues after trying these fixes, please:
1. Check the browser console for detailed error messages
2. Contact support with the error details
3. Include your browser version and operating system
