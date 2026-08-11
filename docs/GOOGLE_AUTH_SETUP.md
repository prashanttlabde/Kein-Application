# Google Authentication Setup Guide

This guide will walk you through setting up Google OAuth authentication for your Keinshop application.

## Prerequisites

- A Google Cloud Platform account
- Access to your Supabase project dashboard
- Your application's production and development URLs

## Step 1: Configure Google Cloud Console

### 1.1 Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Keinshop")
5. Click "Create"

### 1.2 Enable Google+ API

1. In the left sidebar, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 1.3 Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (or "Internal" if using Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Keinshop
   - **User support email**: Your email
   - **App logo**: (Optional) Upload your logo
   - **App domain**: Your domain
   - **Authorized domains**: Add your domains (e.g., `keinshop.com`)
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. **Scopes**: Add the following scopes:
   - `openid`
   - `email`
   - `profile`
7. Click "Save and Continue"
8. **Test users**: (Optional) Add test users if in testing mode
9. Click "Save and Continue"
10. Review and click "Back to Dashboard"

### 1.4 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Fill in the details:
   - **Name**: Keinshop Web Client
   - **Authorized JavaScript origins**: Add your URLs:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - **Authorized redirect URIs**: Add your Supabase callback URLs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:54321/auth/v1/callback` (for local Supabase)
5. Click "Create"
6. **Important**: Copy your **Client ID** and **Client Secret**

## Step 2: Configure Supabase

### 2.1 Enable Google Provider

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Authentication" > "Providers"
4. Find "Google" in the list and click to expand
5. Toggle "Enable Sign in with Google" to ON
6. Enter your credentials:
   - **Client ID**: Paste the Client ID from Google Cloud Console
   - **Client Secret**: Paste the Client Secret from Google Cloud Console
7. **Authorized Client IDs**: (Optional) Add additional client IDs for mobile apps
8. Click "Save"

### 2.2 Configure Redirect URLs

1. In Supabase Dashboard, go to "Authentication" > "URL Configuration"
2. Add your site URLs:
   - **Site URL**: `https://your-domain.com`
   - **Redirect URLs**: Add these URLs:
     - `http://localhost:3000/auth/callback`
     - `https://your-domain.com/auth/callback`
     - `http://localhost:3000/**` (wildcard for development)
     - `https://your-domain.com/**` (wildcard for production)
3. Click "Save"

## Step 3: Configure Your Application

### 3.1 Update Environment Variables

Create or update your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth Configuration (Optional - for additional configuration)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3.2 Update Google Cloud Console with Final URLs

Once you deploy to production:

1. Go back to Google Cloud Console > "Credentials"
2. Click on your OAuth 2.0 Client ID
3. Update the **Authorized redirect URIs** to include your production URL:
   - `https://your-production-domain.com/auth/callback`
4. Update the **Authorized JavaScript origins**:
   - `https://your-production-domain.com`
5. Click "Save"

## Step 4: Using Google Sign-In in Your App

The Google Sign-In button is already implemented. Here's how to use it:

### Example Usage

```tsx
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <GoogleSignInButton 
        redirectTo="/dashboard"
        onSuccess={() => console.log('Sign in successful!')}
        onError={(error) => console.error('Sign in failed:', error)}
      />
    </div>
  )
}
```

### Component Props

- `redirectTo` (optional): Where to redirect after successful sign-in (default: `/dashboard`)
- `onSuccess` (optional): Callback function called on successful sign-in
- `onError` (optional): Callback function called on error

## Step 5: Testing

### Local Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your login page

3. Click the "Continue with Google" button

4. You should be redirected to Google's consent screen

5. After granting permission, you should be redirected back to your app

### Production Testing

1. Deploy your application

2. Update all URLs in Google Cloud Console and Supabase Dashboard

3. Test the complete flow in production

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**
   - Error: `redirect_uri_mismatch`
   - Solution: Ensure the redirect URI in Google Cloud Console exactly matches your Supabase callback URL

2. **Unauthorized Client**
   - Error: `unauthorized_client`
   - Solution: Check that your Client ID and Client Secret are correctly entered in Supabase

3. **Access Blocked**
   - Error: App not verified
   - Solution: Add test users in Google Cloud Console or submit your app for verification

4. **Session Not Persisting**
   - Check that cookies are enabled in your browser
   - Verify that your Supabase client is configured with `persistSession: true`

5. **CORS Errors**
   - Ensure your domain is added to "Authorized JavaScript origins" in Google Cloud Console
   - Check Supabase CORS settings

### Debug Mode

Enable debug logging in your Supabase client:

```typescript
const supabase = createClient(url, key, {
  auth: {
    debug: true, // Enable auth debug logs
  },
})
```

## Security Best Practices

1. **Never commit credentials**: Keep `.env.local` in `.gitignore`

2. **Use environment variables**: Store all sensitive data in environment variables

3. **Rotate secrets regularly**: Periodically regenerate your Client Secret

4. **Limit scopes**: Only request the scopes you need

5. **Validate on server**: Always verify tokens on the server side

6. **Use HTTPS**: Always use HTTPS in production

7. **Monitor logs**: Regularly check Supabase logs for suspicious activity

## Additional Resources

- [Supabase Google Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)

## Support

If you encounter issues:

1. Check the Supabase logs in your dashboard
2. Review browser console for errors
3. Verify all URLs are correctly configured
4. Contact Supabase support or create an issue on GitHub
