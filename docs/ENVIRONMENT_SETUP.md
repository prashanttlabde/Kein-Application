# Environment Variables Setup Guide

## Required Environment Variables

Your application requires Supabase credentials to function properly. Follow these steps to set them up:

### 1. Create `.env.local` file

If it doesn't exist, create a `.env.local` file in the root directory of your project.

### 2. Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API** (or visit: `https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/settings/api`)
4. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   - **anon/public key** (starts with `eyJhbGc...`)

### 3. Add to `.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Restart Your Development Server

After adding the environment variables, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Optional Environment Variables

### Service Role Key (Admin Operations)
If you need to perform admin operations (user management, bypassing RLS, etc.):

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Warning**: Never expose the service role key in client-side code or commit it to version control!

### HMS (100ms) for Live Streaming
If you're using 100ms for live streaming features:

```bash
NEXT_PUBLIC_HMS_TOKEN_ENDPOINT=your-hms-token-endpoint
HMS_MANAGEMENT_TOKEN=your-hms-management-token
```

## Verification

To verify your setup is correct:

1. Start the dev server: `npm run dev`
2. Check the console for any error messages about missing environment variables
3. If configured correctly, you should see no Supabase-related errors

## Troubleshooting

### Error: "Your project's URL and Key are required"

This means your `.env.local` file is missing or has incorrect values. Make sure:
- The file is named exactly `.env.local` (not `.env.local.txt`)
- It's in the root directory of your project
- You've restarted the development server after creating/modifying it
- The values are correct (no extra spaces, quotes, or line breaks)

### Environment Variables Not Loading

1. Ensure `.env.local` is in the root directory (same level as `package.json`)
2. Restart your development server completely
3. Check that variable names start with `NEXT_PUBLIC_` for client-side access
4. Verify no syntax errors in the `.env.local` file

## Security Best Practices

✅ **DO:**
- Add `.env.local` to `.gitignore` (already done)
- Use `.env.example` for documenting required variables
- Use `NEXT_PUBLIC_` prefix only for non-sensitive, client-side variables
- Keep service role keys in `.env.local` only (never in client code)

❌ **DON'T:**
- Commit `.env.local` to version control
- Share your environment variables publicly
- Use production credentials in development
- Hardcode API keys in your source code
