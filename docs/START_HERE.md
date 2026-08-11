# 🚀 Google Login Setup - START HERE

Welcome! Your Google authentication system is ready to be configured. This guide will get you up and running in **under 10 minutes**.

## 📋 What You'll Need

Before starting, gather these items:
- [ ] Access to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Access to your [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Your project's development URL (`http://localhost:3000`)
- [ ] Your project's production URL (`https://kein.in`)

## 🎯 Quick Setup (3 Steps)

### Step 1: Google Cloud Console (3 minutes)

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)

2. **Create OAuth Credentials**:
   - Navigate to: `APIs & Services` → `Credentials`
   - Click: `Create Credentials` → `OAuth client ID`
   - Select: `Web application`
   - Add Authorized redirect URIs:
     ```
     https://xyzcompany.supabase.co/auth/v1/callback
     ```
     (Replace `xyzcompany` with your Supabase project reference)

3. **Copy Your Credentials**:
   - ✅ Client ID (looks like: `xxx.apps.googleusercontent.com`)
   - ✅ Client Secret (keep this secure!)

### Step 2: Supabase Dashboard (2 minutes)

1. **Go to**: [Your Supabase Project](https://supabase.com/dashboard)

2. **Enable Google**:
   - Navigate to: `Authentication` → `Providers`
   - Find `Google` and toggle it **ON**
   - Paste your **Client ID** and **Client Secret**
   - Click **Save**

3. **Copy Your Supabase Keys**:
   - Navigate to: `Settings` → `API`
   - ✅ Copy your Project URL
   - ✅ Copy your anon/public key

### Step 3: Environment Setup (2 minutes)

1. **Create `.env.local` file** in your project root:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

2. **Install dependencies** (if not already):
   ```bash
   npm install
   ```

3. **Start your server**:
   ```bash
   npm run dev
   ```

## ✅ Test It Out!

1. Open your browser to: `http://localhost:3000/auth/signin`

2. Click the **"Continue with Google"** button

3. Sign in with your Google account

4. You should be redirected back to your app! 🎉

## 📁 What Was Created

Your project now includes:

```
my-app/
├── components/auth/
│   └── GoogleSignInButton.tsx          ← The sign-in button component
├── app/auth/
│   ├── callback/
│   │   └── route.ts                    ← Handles OAuth callback
│   ├── error/
│   │   └── page.tsx                    ← Error page
│   └── signin/
│       └── page.tsx                    ← Example sign-in page
├── docs/
│   ├── GOOGLE_AUTH_README.md           ← Main documentation
│   ├── GOOGLE_AUTH_SETUP.md            ← Detailed setup guide
│   ├── GOOGLE_AUTH_USAGE.md            ← Usage examples
│   └── GOOGLE_AUTH_CHECKLIST.md        ← Configuration checklist
└── .env.local.example                  ← Environment template
```

## 🎨 Using the Google Button

Add it to any page:

```tsx
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function YourPage() {
  return (
    <GoogleSignInButton 
      redirectTo="/dashboard"
      onSuccess={() => console.log('Logged in!')}
    />
  )
}
```

## 📚 Next Steps

1. ✅ Complete the 3-step setup above
2. ✅ Test the authentication flow
3. 📖 Read `docs/GOOGLE_AUTH_USAGE.md` for more examples
4. ✏️ Add the button to your auth pages
5. 🚀 Deploy to production (update URLs in Google Console)

## 🆘 Need Help?

### Quick Troubleshooting

**Problem**: "Redirect URI mismatch"
- **Fix**: Make sure the redirect URI in Google Console matches exactly:
  ```
  https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
  ```

**Problem**: "Unauthorized client"
- **Fix**: Double-check your Client ID and Secret in Supabase Dashboard

**Problem**: Not working on localhost
- **Fix**: Add `http://localhost:3000` to Authorized JavaScript origins in Google Console

### More Help

- 📖 See `docs/GOOGLE_AUTH_SETUP.md` for detailed troubleshooting
- 📋 Use `docs/GOOGLE_AUTH_CHECKLIST.md` to verify your setup
- 🔍 Check browser console for error messages
- 📊 Review Supabase logs in your dashboard

## 🔐 Security Checklist

Before going to production:

- [ ] `.env.local` is in `.gitignore`
- [ ] Using HTTPS in production
- [ ] Updated all URLs to production domains
- [ ] Tested sign-in flow in production
- [ ] Reviewed Supabase Row Level Security policies

## 💡 Pro Tips

1. **Test with multiple Google accounts** to ensure it works for everyone
2. **Set up error tracking** to catch authentication issues
3. **Add analytics** to track sign-up conversions
4. **Customize the button styling** to match your brand
5. **Add other OAuth providers** for more options (Facebook, GitHub, etc.)

## 📞 Support Resources

- **Supabase Docs**: [Social Login Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- **Google OAuth Docs**: [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- **This Project's Docs**: See the `docs/` folder for detailed guides

---

## Ready to Start? 🚀

1. Open this file: `docs/GOOGLE_AUTH_CHECKLIST.md`
2. Follow the checklist step by step
3. Test your authentication
4. Start building! 🎉

**Estimated time**: 10 minutes
**Difficulty**: Easy ✅

---

**Questions?** Check the troubleshooting section in `docs/GOOGLE_AUTH_SETUP.md`

**Happy coding!** 👨‍💻👩‍💻
