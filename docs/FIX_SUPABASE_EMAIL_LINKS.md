# Fix Supabase Email Verification Links for Kein.in

## 🔴 Problem
Supabase is sending email verification links pointing to `http://localhost:3000` instead of `https://kein.in`

## ✅ Solution

### Step 1: Update Supabase Dashboard Settings

**Go to your Supabase Dashboard:**
1. Visit: https://supabase.com/dashboard/project/eafxupeakpgpypxczvxk/settings/auth
2. Navigate to: **Settings** → **Authentication** → **URL Configuration**

**Update these settings:**

#### **Site URL:**
```
https://kein.in
```

#### **Redirect URLs (Add all these):**
```
https://kein.in/auth/callback
https://kein.in/auth/verify
https://kein.in/*
http://localhost:3000/auth/callback (for local development)
http://localhost:3000/auth/verify (for local development)
```

#### **Email Templates:**
1. Go to: **Authentication** → **Email Templates**
2. For each template (Confirm signup, Magic Link, Change Email, Reset Password):
   - Replace `{{ .SiteURL }}` references with `https://kein.in`
   - Or ensure the Site URL is set correctly above

**Quick Links:**
- **Auth Settings:** https://supabase.com/dashboard/project/eafxupeakpgpypxczvxk/settings/auth
- **Email Templates:** https://supabase.com/dashboard/project/eafxupeakpgpypxczvxk/auth/templates

---

### Step 2: Update Your .env.local File

Update your local environment file for production deployment:

```bash
# For Production (kein.in)
NEXT_PUBLIC_APP_URL=https://kein.in

# For Local Development
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** 
- Keep `http://localhost:3000` for local development
- Use `https://kein.in` for production deployment

---

### Step 3: Update Your Deployment Platform

#### **If using Railway:**
1. Go to your Railway project dashboard
2. Navigate to **Variables**
3. Add/Update:
   ```
   NEXT_PUBLIC_APP_URL=https://kein.in
   NEXT_PUBLIC_SITE_URL=https://kein.in
   ```

#### **If using Vercel:**
1. Go to Project Settings → Environment Variables
2. Add/Update:
   ```
   NEXT_PUBLIC_APP_URL=https://kein.in
   NEXT_PUBLIC_SITE_URL=https://kein.in
   ```

#### **If using other platforms:**
Set the environment variable in your deployment configuration.

---

### Step 4: Configure Email Template Variables (Optional)

If you want to customize email templates, update them in Supabase:

#### **Confirm Signup Template:**
```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your email:</p>
<p><a href="https://kein.in/auth/callback?token_hash={{ .TokenHash }}&type=email">Confirm your email</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>https://kein.in/auth/callback?token_hash={{ .TokenHash }}&type=email</p>
```

#### **Magic Link Template:**
```html
<h2>Magic Link</h2>

<p>Follow this link to login:</p>
<p><a href="https://kein.in/auth/callback?token_hash={{ .TokenHash }}&type=magiclink">Log In</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>https://kein.in/auth/callback?token_hash={{ .TokenHash }}&type=magiclink</p>
```

#### **Reset Password Template:**
```html
<h2>Reset Password</h2>

<p>Follow this link to reset your password:</p>
<p><a href="https://kein.in/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>https://kein.in/auth/callback?token_hash={{ .TokenHash }}&type=recovery</p>
```

---

### Step 5: Create Auth Callback Handler (if not exists)

Create or verify this file exists:

**File:** `app/auth/callback/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
  }

  if (token_hash && type) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (error) {
      console.error('Verification error:', error)
      return NextResponse.redirect(new URL('/auth/error', requestUrl.origin))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
```

---

### Step 6: Test the Configuration

#### **Test Email Verification:**
1. Sign up with a new email address
2. Check your email
3. Verify the link points to `https://kein.in/auth/callback`
4. Click the link and confirm it works

#### **Test Password Reset:**
1. Request a password reset
2. Check your email
3. Verify the link points to `https://kein.in/auth/callback`
4. Click the link and confirm it works

---

## 🔍 Troubleshooting

### Issue: Still getting localhost links
**Solution:**
- Clear Supabase cache (wait 5 minutes after changes)
- Check Site URL in Supabase dashboard
- Verify NEXT_PUBLIC_APP_URL in deployment

### Issue: "Invalid redirect URL" error
**Solution:**
- Add the redirect URL to the allowed list in Supabase
- Make sure wildcards are enabled: `https://kein.in/*`

### Issue: Email links not working
**Solution:**
- Check auth callback route exists
- Verify token_hash parameter handling
- Check browser console for errors

### Issue: Links work on production but not locally
**Solution:**
- Keep `http://localhost:3000` in redirect URLs
- Use different NEXT_PUBLIC_APP_URL for local vs production
- Consider using environment-specific .env files

---

## 📝 Environment Setup Best Practices

### For Local Development:
**`.env.local`**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### For Production:
**Set in your deployment platform:**
```bash
NEXT_PUBLIC_APP_URL=https://kein.in
NEXT_PUBLIC_SITE_URL=https://kein.in
```

### For Staging (if you have one):
```bash
NEXT_PUBLIC_APP_URL=https://staging.kein.in
NEXT_PUBLIC_SITE_URL=https://staging.kein.in
```

---

## ✅ Verification Checklist

- [ ] Updated Site URL in Supabase to `https://kein.in`
- [ ] Added redirect URLs in Supabase
- [ ] Updated email templates (if customized)
- [ ] Updated NEXT_PUBLIC_APP_URL in production
- [ ] Created/verified auth callback route
- [ ] Tested email verification
- [ ] Tested password reset
- [ ] Tested magic link (if used)

---

## 🔗 Important Links

**Supabase Dashboard:**
- Auth Settings: https://supabase.com/dashboard/project/eafxupeakpgpypxczvxk/settings/auth
- Email Templates: https://supabase.com/dashboard/project/eafxupeakpgpypxczvxk/auth/templates
- URL Configuration: https://supabase.com/dashboard/project/eafxupeakpgpypxczvxk/auth/url-configuration

**Documentation:**
- Supabase Auth: https://supabase.com/docs/guides/auth
- Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates
- Redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls

---

**Priority:** 🔴 HIGH - Fix this immediately for production  
**Time Required:** 5-10 minutes  
**Difficulty:** Easy
