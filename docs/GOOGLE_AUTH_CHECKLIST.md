# Google OAuth Setup Checklist

Use this checklist to ensure everything is properly configured.

## ✅ Google Cloud Console Configuration

### 1. Project Setup
- [ ] Created or selected a Google Cloud project
- [ ] Noted project name: ________________

### 2. API Configuration
- [ ] Enabled Google+ API
- [ ] Verified API is enabled in API Library

### 3. OAuth Consent Screen
- [ ] Configured consent screen type (External/Internal)
- [ ] Added app name: ________________
- [ ] Added support email: ________________
- [ ] Added authorized domains: ________________
- [ ] Added required scopes:
  - [ ] openid
  - [ ] email
  - [ ] profile
- [ ] Saved consent screen configuration

### 4. OAuth 2.0 Credentials
- [ ] Created OAuth 2.0 Client ID
- [ ] Selected "Web application" type
- [ ] Added JavaScript origins:
  - [ ] `http://localhost:3000` (development)
  - [ ] `https://your-domain.com` (production)
- [ ] Added redirect URIs:
  - [ ] `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
  - [ ] `http://localhost:54321/auth/v1/callback` (local Supabase CLI)
- [ ] Copied Client ID: ________________
- [ ] Copied Client Secret: ________________

## ✅ Supabase Configuration

### 1. Project Setup
- [ ] Logged into Supabase Dashboard
- [ ] Selected correct project
- [ ] Noted project reference: ________________

### 2. Authentication Provider
- [ ] Navigated to Authentication > Providers
- [ ] Found Google in the provider list
- [ ] Toggled "Enable Sign in with Google" to ON
- [ ] Pasted Google Client ID
- [ ] Pasted Google Client Secret
- [ ] Clicked Save

### 3. URL Configuration
- [ ] Navigated to Authentication > URL Configuration
- [ ] Set Site URL: ________________
- [ ] Added redirect URLs:
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `http://localhost:3000/**`
  - [ ] `https://your-domain.com/auth/callback`
  - [ ] `https://your-domain.com/**`
- [ ] Clicked Save

### 4. API Keys
- [ ] Copied Project URL: ________________
- [ ] Copied anon/public key: ________________
- [ ] Copied service_role key (keep secure!): ________________

## ✅ Application Configuration

### 1. Environment Variables
- [ ] Created `.env.local` file in project root
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Verified `.env.local` is in `.gitignore`

### 2. File Structure
- [ ] Verified `components/auth/GoogleSignInButton.tsx` exists
- [ ] Verified `app/auth/callback/route.ts` exists
- [ ] Verified `app/auth/error/page.tsx` exists
- [ ] Verified `app/auth/signin/page.tsx` exists (example)

### 3. Dependencies
- [ ] Verified `@supabase/supabase-js` is installed
- [ ] Run `npm install` to ensure all dependencies are installed

## ✅ Testing

### 1. Local Development
- [ ] Started dev server: `npm run dev`
- [ ] Visited `http://localhost:3000/auth/signin`
- [ ] Clicked "Continue with Google" button
- [ ] Redirected to Google consent screen
- [ ] Granted permissions
- [ ] Successfully redirected back to application
- [ ] Verified user session is created
- [ ] Checked browser console for errors
- [ ] Verified cookies are set

### 2. Error Handling
- [ ] Tested authentication failure scenarios
- [ ] Verified error page displays correctly
- [ ] Checked error messages are user-friendly

### 3. Session Management
- [ ] Verified session persists after page refresh
- [ ] Tested sign out functionality
- [ ] Verified session is cleared after sign out

## ✅ Production Deployment

### 1. Update Google Cloud Console
- [ ] Added production JavaScript origins
- [ ] Added production redirect URIs
- [ ] Verified all URLs use HTTPS

### 2. Update Supabase
- [ ] Added production URLs to redirect allowlist
- [ ] Verified Site URL is set to production domain

### 3. Environment Variables
- [ ] Set production environment variables in hosting platform
- [ ] Verified environment variables are not committed to git
- [ ] Tested production build locally: `npm run build`

### 4. Final Testing
- [ ] Deployed to production
- [ ] Tested Google sign-in on production URL
- [ ] Verified redirect flow works correctly
- [ ] Checked production logs for errors
- [ ] Confirmed user data is stored correctly

## ✅ Security Review

- [ ] Verified `.env.local` is in `.gitignore`
- [ ] Confirmed secrets are not in source control
- [ ] Reviewed Supabase Row Level Security (RLS) policies
- [ ] Enabled HTTPS on production domain
- [ ] Verified cookies are HTTP-only and secure in production
- [ ] Reviewed Google Cloud Console security settings
- [ ] Limited OAuth scopes to only what's needed

## ✅ Documentation

- [ ] Read `docs/GOOGLE_AUTH_README.md`
- [ ] Read `docs/GOOGLE_AUTH_SETUP.md`
- [ ] Read `docs/GOOGLE_AUTH_USAGE.md`
- [ ] Shared setup instructions with team (if applicable)

## 📝 Notes

Use this space to note any issues or customizations:

```
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
```

## 🎉 Completion

**Date Completed**: ________________

**Completed By**: ________________

**Production URL**: ________________

**Notes**: 
```
_______________________________________________
_______________________________________________
```

---

## 🆘 Common Issues Reference

If you encounter issues, refer to these common problems:

1. **Redirect URI Mismatch**: Double-check URLs match exactly
2. **Unauthorized Client**: Verify Client ID and Secret
3. **Session Not Persisting**: Check cookie settings
4. **CORS Errors**: Verify JavaScript origins in Google Console
5. **404 on Callback**: Ensure callback route exists

See `docs/GOOGLE_AUTH_SETUP.md` for detailed troubleshooting.
