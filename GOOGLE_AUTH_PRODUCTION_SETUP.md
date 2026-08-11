# 🚀 Google OAuth Production Setup for kein.in

## 📋 Current Status

### ✅ What's Working
- ✅ Google OAuth works on `localhost`
- ✅ OAuth callback route properly implemented
- ✅ Environment variables configured for local development
- ✅ Code improvements applied (better error handling)

### ❌ What's Missing for Production
- ❌ Production redirect URI not in Google Cloud Console
- ❌ Railway environment variables not configured
- ❌ Supabase production redirect URLs not configured

---

## 🔧 Complete Production Setup (3 Steps)

### **Step 1: Google Cloud Console Configuration** ⚡ CRITICAL

1. **Navigate to Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Select project: **keinshop**

2. **Go to Credentials**
   - Click: **APIs & Services** → **Credentials**
   - Find OAuth 2.0 Client ID: `857989702767-9b949ctaj54puak84dhul5b64reungt2`
   - Click to edit

3. **Add Production Redirect URI**
   
   Under **Authorized redirect URIs**, you currently have:
   ```
   ✅ https://eafxupeakpgpypxczvxk.supabase.co/auth/v1/callback
   ✅ http://localhost:54321/auth/v1/callback
   ```
   
   **ADD THIS:**
   ```
   https://kein.in/auth/callback
   ```

4. **Final Configuration Should Be:**
   ```
   ✅ https://eafxupeakpgpypxczvxk.supabase.co/auth/v1/callback  (Supabase)
   ✅ http://localhost:54321/auth/v1/callback                    (Local Supabase)
   ✅ https://kein.in/auth/callback                              (Production)
   ```

5. **Click SAVE**

> **Why?** Google only allows redirects to pre-approved URLs. Without this, users will see "Error 400: redirect_uri_mismatch"

---

### **Step 2: Supabase Dashboard Configuration** ⚡ CRITICAL

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com/project/eafxupeakpgpypxczvxk
   - Login if needed

2. **Configure Authentication URLs**
   - Click: **Authentication** (left sidebar)
   - Click: **URL Configuration**

3. **Set Site URL**
   ```
   Production Site URL: https://kein.in
   ```

4. **Add Redirect URLs**
   
   In the **Redirect URLs** section, add:
   ```
   http://localhost:3000/auth/callback
   https://kein.in/auth/callback
   ```
   
   **Note:** One URL per line

5. **Verify Google Provider Settings**
   - Click: **Authentication** → **Providers**
   - Click: **Google**
   - Verify credentials are set:
     ```
     Client ID: 857989702767-9b949ctaj54puak84dhul5b64reungt2.apps.googleusercontent.com
     Client Secret: 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
     ```
   - Ensure **Enabled** toggle is ON

6. **Click SAVE**

> **Why?** Supabase validates redirect URLs for security. Without this, the OAuth flow will fail.

---

### **Step 3: Railway Environment Variables** ⚡ CRITICAL

Your Railway deployment needs these environment variables configured in the Railway dashboard (NOT in files).

1. **Go to Railway Dashboard**
   - URL: https://railway.app/
   - Navigate to your project

2. **Select Your Service**
   - Click on the service running your Next.js app

3. **Go to Variables Tab**
   - Click: **Variables** in the top menu

4. **Add These Environment Variables:**

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://eafxupeakpgpypxczvxk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
   SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
   
   # Site Configuration
   NEXT_PUBLIC_SITE_URL=https://kein.in
   
   # Node Environment
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

5. **Get Your Supabase Keys**
   - Go to: https://app.supabase.com/project/eafxupeakpgpypxczvxk/settings/api
   - Copy: **Project URL** (should be `https://eafxupeakpgpypxczvxk.supabase.co`)
   - Copy: **anon/public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy: **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY`

6. **Save and Redeploy**
   - Railway will automatically redeploy when you add variables
   - Or manually trigger a redeploy from the **Deployments** tab

> **Why?** Environment variables in files are not included in production builds. Railway needs them set in the dashboard.

---

## 🧪 Testing Your Production Setup

### **Test 1: Visit Production Site**
```
1. Open browser (incognito mode recommended)
2. Go to: https://kein.in
3. Look for Google Sign-In button
```

### **Test 2: Attempt Google Sign-In**
```
1. Click "Sign in with Google"
2. Should redirect to: accounts.google.com
3. Choose Google account
4. Should redirect to: https://kein.in/auth/callback
5. Should redirect to: https://kein.in (logged in)
```

### **Test 3: Check for Errors**

**If you see "redirect_uri_mismatch":**
- ❌ Step 1 incomplete: Production URI not in Google Cloud Console
- ✅ Fix: Go back to Step 1 and add `https://kein.in/auth/callback`

**If you see "Invalid redirect URL":**
- ❌ Step 2 incomplete: Redirect URL not in Supabase
- ✅ Fix: Go back to Step 2 and add redirect URLs

**If OAuth starts but fails to create session:**
- ❌ Step 3 incomplete: Environment variables not set
- ✅ Fix: Check Railway logs and ensure all variables are set

**If nothing happens when clicking the button:**
- ❌ Check browser console for errors
- ❌ Verify `NEXT_PUBLIC_SITE_URL` is set in Railway

---

## 🔍 Debugging Production Issues

### **Check Railway Logs**

1. Go to Railway dashboard
2. Click your service
3. Click **Deployments**
4. Click on the latest deployment
5. View logs for errors

**Look for:**
```
✅ OAuth session established for: user@example.com
✅ Redirecting to: /
```

**Or errors:**
```
❌ Error exchanging code for session: [error message]
```

### **Check Browser Developer Tools**

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors starting with ❌
4. Check **Network** tab for failed requests

### **Verify Environment Variables in Production**

Add this to any page temporarily to verify:

```typescript
// app/debug/page.tsx
export default function Debug() {
  return (
    <div>
      <h1>Environment Check</h1>
      <ul>
        <li>NEXT_PUBLIC_SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL || '❌ NOT SET'}</li>
        <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ NOT SET'}</li>
        <li>Has ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET'}</li>
      </ul>
    </div>
  )
}
```

Visit: `https://kein.in/debug` and verify all show ✅ SET

---

## 📊 Architecture Overview

```
User clicks "Sign in with Google" on kein.in
         ↓
    1. Browser initiates OAuth (GoogleSignInButton.tsx)
       - Redirect: ${NEXT_PUBLIC_SITE_URL}/auth/callback
         ↓
    2. Redirects to accounts.google.com
       - User selects account
       - Google validates redirect URI (must be in Google Cloud Console)
         ↓
    3. Google redirects back: https://kein.in/auth/callback?code=ABC123
       - Supabase validates redirect URL (must be in Supabase config)
         ↓
    4. Callback Route Handler (app/auth/callback/route.ts)
       - Exchanges code for session
       - Sets auth cookies
       - Redirects to homepage
         ↓
    5. User is authenticated ✅
```

---

## 🎯 Quick Checklist

Before testing in production, verify:

- [ ] Added `https://kein.in/auth/callback` to Google Cloud Console
- [ ] Added redirect URLs to Supabase Dashboard
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://kein.in` in Railway
- [ ] Set all Supabase environment variables in Railway
- [ ] Deployed latest code to Railway
- [ ] Tested in incognito mode

---

## 🆘 Still Having Issues?

### Common Problems & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| "redirect_uri_mismatch" | Google doesn't recognize callback URL | Add to Google Cloud Console authorized URIs |
| "Invalid redirect URL" | Supabase doesn't recognize callback | Add to Supabase redirect URLs |
| Code exchange fails | Missing environment variables | Check Railway variables tab |
| Button doesn't work | `NEXT_PUBLIC_SITE_URL` not set | Add to Railway variables |
| Session not created | Supabase keys incorrect | Verify keys in Railway match Supabase |

### Getting Help

If issues persist:

1. **Check Railway Logs** - Most errors appear here
2. **Check Browser Console** - Client-side errors
3. **Verify All 3 Steps** - Double-check each configuration
4. **Test Locally First** - Ensure local OAuth still works

---

## 📝 Summary

**What changed in code:**
- ✅ Enhanced error handling in callback route
- ✅ Better logging for debugging OAuth issues
- ✅ Improved Google button to use `NEXT_PUBLIC_SITE_URL`
- ✅ Added error parameter handling from OAuth providers

**What you need to configure:**
1. **Google Cloud Console** - Add production redirect URI
2. **Supabase Dashboard** - Add production redirect URLs
3. **Railway Variables** - Add all environment variables

**After completing all 3 steps:**
- Google OAuth will work on both localhost AND kein.in
- Users can sign in/sign up with Google on production
- Proper error messages will appear if something fails

---

## 🚀 Next Steps

1. Complete Steps 1-3 above
2. Deploy to Railway (or trigger redeploy if auto-deploy is on)
3. Test on https://kein.in
4. Monitor Railway logs during testing
5. Verify successful login ✅

Good luck! 🎉
