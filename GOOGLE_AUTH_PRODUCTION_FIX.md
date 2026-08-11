# 🔧 Google Sign-In Production Fix Guide

## Issue Summary
Google Sign-In works on **localhost** but fails on **kein.in** production.

## Root Causes Identified

### 1. ❌ Missing Environment Variable
**.env.production** was missing `NEXT_PUBLIC_SITE_URL`

**Status**: ✅ **FIXED** - Added to `.env.production`

### 2. ❌ Missing Production Redirect URI in Google Cloud Console
Your Google OAuth credentials don't include the production callback URL.

### 3. ⚠️ Potential Supabase Configuration Issue
Production redirect URLs may not be configured in Supabase Dashboard.

---

## 🚀 Step-by-Step Fix

### Step 1: Update Google Cloud Console ✅ REQUIRED

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/
   - Select project: **keinshop**

2. **Go to OAuth 2.0 Credentials**
   - Navigate to: **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID: `857989702767-9b949ctaj54puak84dhul5b64reungt2`

3. **Add Production Redirect URI**
   
   In the **Authorized redirect URIs** section, add:
   ```
   https://kein.in/auth/callback
   ```

4. **Your final list should include:**
   ```
   ✅ https://eafxupeakpgpypxczvxk.supabase.co/auth/v1/callback
   ✅ http://localhost:54321/auth/v1/callback
   ✅ https://kein.in/auth/callback  ← ADD THIS
   ```

5. **Click "SAVE"**

---

### Step 2: Update Supabase Dashboard ✅ REQUIRED

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com/project/eafxupeakpgpypxczvxk

2. **Open Authentication Settings**
   - Click: **Authentication** → **URL Configuration**

3. **Update Site URL**
   ```
   Production: https://kein.in
   ```

4. **Add Redirect URLs**
   
   Add these URLs to the **Redirect URLs** section:
   ```
   http://localhost:3000/auth/callback
   https://kein.in/auth/callback
   ```

5. **Click "Save"**

---

### Step 3: Verify Environment Variables ✅ COMPLETED

The `.env.production` file has been updated with:
```bash
NEXT_PUBLIC_SITE_URL=https://kein.in
```

**Action Required**: Deploy this change to your production environment (Railway/Vercel/etc.)

---

### Step 4: Deploy to Production

Depending on your hosting platform:

#### If using Railway:
```bash
git add .env.production
git commit -m "fix: Add NEXT_PUBLIC_SITE_URL for production OAuth"
git push origin master
```

Railway will automatically redeploy with the new environment variable.

#### If using Vercel:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add: 
   - **Key**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://kein.in`
   - **Environment**: Production
4. Click **Save**
5. Trigger a redeploy

#### For other platforms:
Make sure `NEXT_PUBLIC_SITE_URL=https://kein.in` is set in your production environment variables.

---

## 🧪 Testing the Fix

### Test on Production (kein.in):

1. **Clear browser cache and cookies** for kein.in

2. **Visit**: https://kein.in/auth

3. **Click "Continue with Google"**

4. **You should be redirected to Google sign-in**

5. **After signing in with Google**, you should be:
   - Redirected to: `https://kein.in/auth/callback?code=XXXX`
   - Then automatically to: `https://kein.in/`
   - Now logged in! ✅

### If it still doesn't work:

1. **Check browser console** for errors (F12 → Console tab)

2. **Check the redirect URL in the browser address bar** when clicking Google sign-in
   - Should redirect to Google with a `redirect_uri` parameter
   - The `redirect_uri` should be: `https://kein.in/auth/callback`

3. **Verify all three configurations are correct:**
   - ✅ Google Cloud Console has `https://kein.in/auth/callback`
   - ✅ Supabase Dashboard has `https://kein.in/auth/callback`
   - ✅ Production environment has `NEXT_PUBLIC_SITE_URL=https://kein.in`

---

## 🔍 Debugging Tips

### Check if environment variable is loaded:
Add this temporarily to your production site to verify:

```typescript
// In app/auth/page.tsx (temporarily)
console.log('SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
```

After deploying, visit https://kein.in/auth and check the browser console.
You should see: `SITE_URL: https://kein.in`

### Check the OAuth redirect:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Continue with Google"
4. Look for the redirect URL in the network requests
5. It should include `redirect_uri=https%3A%2F%2Fkein.in%2Fauth%2Fcallback`

---

## 📋 Quick Checklist

Before testing, ensure:

- [ ] Google Cloud Console: Added `https://kein.in/auth/callback` to Authorized redirect URIs
- [ ] Supabase Dashboard: Added `https://kein.in/auth/callback` to Redirect URLs
- [ ] Supabase Dashboard: Site URL is set to `https://kein.in`
- [ ] Environment Variable: `NEXT_PUBLIC_SITE_URL=https://kein.in` is deployed to production
- [ ] Cleared browser cache and cookies
- [ ] Redeployed application with new environment variables

---

## 🎯 Why This Happens

The OAuth flow requires three components to match:

1. **Google knows where to send users back** → Authorized Redirect URIs in Google Cloud Console
2. **Your app tells Google where to redirect** → `NEXT_PUBLIC_SITE_URL/auth/callback` in your code
3. **Supabase validates the redirect** → Redirect URLs in Supabase Dashboard

If any of these don't match **exactly**, OAuth fails.

**On localhost**: All three were configured for `http://localhost:3000` ✅
**On production**: Missing the production URLs ❌

---

## 🚀 After Fixing

Once all steps are complete:
1. Users can sign in with Google on kein.in
2. OAuth flow will work seamlessly
3. No more redirect issues

---

## 📞 Still Having Issues?

If Google Sign-In still doesn't work after following all steps:

1. **Check Supabase Logs**:
   - Go to: Supabase Dashboard → Logs → Auth Logs
   - Look for errors related to OAuth

2. **Verify Google OAuth Consent Screen**:
   - Make sure your OAuth consent screen is published (not in testing mode)
   - Or add test users if in testing mode

3. **Check for HTTPS issues**:
   - Ensure kein.in has a valid SSL certificate
   - Google OAuth requires HTTPS in production

4. **Domain verification**:
   - Verify that kein.in is properly configured and accessible

---

**Last Updated**: November 16, 2025
**Status**: Environment variable fixed, pending Google Console and Supabase configuration
