# Google Authentication - Complete Setup

## 🎉 What's Been Set Up

Your Google OAuth authentication is now ready! Here's what has been created:

### 1. **GoogleSignInButton Component** 
   - Location: `components/auth/GoogleSignInButton.tsx`
   - A beautiful, Google-styled sign-in button
   - Handles OAuth flow automatically
   - Includes loading states and error handling

### 2. **Auth Callback Handler**
   - Location: `app/auth/callback/route.ts`
   - Handles the OAuth redirect from Google
   - Exchanges authorization code for session
   - Sets up secure session cookies

### 3. **Error Page**
   - Location: `app/auth/error/page.tsx`
   - User-friendly error display
   - Handles authentication failures gracefully

### 4. **Example Sign-In Page**
   - Location: `app/auth/signin/page.tsx`
   - Beautiful, production-ready login page
   - Shows how to integrate the Google button

### 5. **Documentation**
   - `docs/GOOGLE_AUTH_SETUP.md` - Complete setup guide
   - `docs/GOOGLE_AUTH_USAGE.md` - Usage examples
   - `.env.local.example` - Environment variable template

## 🚀 Quick Start (5 Minutes)

### Step 1: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials (Web application)
6. Add authorized redirect URIs:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback
   ```
7. Copy your **Client ID** and **Client Secret**

### Step 2: Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Paste your Client ID and Client Secret
5. Save changes

### Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# Copy from .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Test It Out!

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/auth/signin`

3. Click "Continue with Google"

4. You should be redirected to Google's consent screen

5. After authorization, you'll be redirected back to your app!

## 📝 Usage Examples

### Basic Usage

```tsx
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <GoogleSignInButton />
    </div>
  )
}
```

### With Custom Redirect

```tsx
<GoogleSignInButton 
  redirectTo="/dashboard"
  onSuccess={() => console.log('Success!')}
  onError={(error) => console.error(error)}
/>
```

### Add to Your Existing Pages

You can add the Google Sign-In button to any page:

```tsx
// In your existing auth page
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function YourAuthPage() {
  return (
    <div>
      {/* Your existing content */}
      <GoogleSignInButton redirectTo="/dashboard" />
    </div>
  )
}
```

## 🔧 Configuration Options

### GoogleSignInButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `redirectTo` | string | `/dashboard` | Where to redirect after successful sign-in |
| `onSuccess` | () => void | undefined | Callback function on successful sign-in |
| `onError` | (error: Error) => void | undefined | Callback function on error |

## 🎨 Customization

The button comes with Google's official styling, but you can customize the container:

```tsx
<div style={{ maxWidth: '400px', margin: '0 auto' }}>
  <GoogleSignInButton />
</div>
```

## 🔐 Security Features

✅ **PKCE Flow**: Uses secure PKCE authentication flow
✅ **Secure Cookies**: HTTP-only cookies for session management
✅ **Error Handling**: Graceful error handling and user feedback
✅ **Session Persistence**: Automatic session refresh and persistence
✅ **CSRF Protection**: Built-in protection against CSRF attacks

## 📚 Additional Resources

- **Setup Guide**: See `docs/GOOGLE_AUTH_SETUP.md` for detailed setup instructions
- **Usage Guide**: See `docs/GOOGLE_AUTH_USAGE.md` for more usage examples
- **Supabase Docs**: [Social Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- **Google OAuth Docs**: [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

## 🐛 Troubleshooting

### "Redirect URI Mismatch" Error

**Problem**: The redirect URI doesn't match what's configured in Google Cloud Console.

**Solution**: 
1. Go to Google Cloud Console > Credentials
2. Make sure this URL is in "Authorized redirect URIs":
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```

### "Unauthorized Client" Error

**Problem**: Client ID or Client Secret is incorrect.

**Solution**:
1. Verify credentials in Google Cloud Console
2. Update them in Supabase Dashboard > Authentication > Providers > Google

### Session Not Persisting

**Problem**: User is signed out after page refresh.

**Solution**: Check that your Supabase client is configured with `persistSession: true` (already done in `lib/supabase.ts`)

### Development vs Production URLs

**Important**: You need to add BOTH development and production URLs:

**Development**:
- JavaScript origins: `http://localhost:3000`
- Redirect URIs: `http://localhost:54321/auth/v1/callback`

**Production**:
- JavaScript origins: `https://your-domain.com`
- Redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`

## 🎯 Next Steps

1. ✅ Configure Google Cloud Console (Step 1 above)
2. ✅ Configure Supabase (Step 2 above)
3. ✅ Set up environment variables (Step 3 above)
4. ✅ Test the authentication flow
5. 🔄 Add the button to your other pages
6. 🚀 Deploy to production and update URLs

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Review the Supabase logs in your dashboard
3. Verify all URLs are correctly configured
4. See the troubleshooting section above
5. Check the documentation in `docs/` folder

---

**Happy Coding! 🚀**
