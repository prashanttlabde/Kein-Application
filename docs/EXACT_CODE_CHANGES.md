# Exact Code Changes for Your app/auth/page.tsx

## Quick Copy-Paste Integration

Here's exactly what to add to your existing `app/auth/page.tsx` file.

### Step 1: Add Import (Line 9)

Add this line with your other imports at the top:

```tsx
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
```

So your imports section becomes:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { auth } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';  // ← ADD THIS LINE
```

### Step 2: Add Button to JSX

Find the part of your JSX where you want to add the Google button. 

**Option A: Add Before Email Form** (Recommended)

Find where your form starts (around line 120-140), and add this BEFORE the form:

```tsx
{/* ===== ADD THIS GOOGLE SIGN-IN SECTION ===== */}
<div className="space-y-4">
  <GoogleSignInButton 
    redirectTo="/"
    onSuccess={() => {
      console.log('Google sign-in successful!');
    }}
    onError={(error) => {
      setError(error.message);
    }}
  />
  
  {/* Divider */}
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-gray-500">or continue with email</span>
    </div>
  </div>
</div>
{/* ===== END GOOGLE SIGN-IN SECTION ===== */}

{/* Your existing email form below */}
<form onSubmit={handleSubmit}>
  {/* ... your form fields ... */}
</form>
```

**Option B: Add After Email Form**

If you prefer the Google button AFTER your email form, add this AFTER the form:

```tsx
<form onSubmit={handleSubmit}>
  {/* ... your form fields ... */}
</form>

{/* ===== ADD THIS GOOGLE SIGN-IN SECTION ===== */}
<div className="space-y-4 mt-6">
  {/* Divider */}
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-gray-500">or</span>
    </div>
  </div>
  
  <GoogleSignInButton 
    redirectTo="/"
    onError={(error) => setError(error.message)}
  />
</div>
{/* ===== END GOOGLE SIGN-IN SECTION ===== */}
```

### Step 3: (Optional) Clean Up Old Code

If you have an old Google sign-in button or handler, you can optionally remove it:

**Remove (Optional)**: Lines 93-100 - Your old `handleGoogleSignIn` function
**Remove (Optional)**: Any old Google button in your JSX

The new component has its own handler, so the old code isn't needed (but keeping it won't hurt).

## Complete Example

Here's what a section of your auth page should look like after adding the Google button:

```tsx
return (
  <div className="min-h-screen from-blue-50 via-white to-green-50">
    <div className="max-w-md mx-auto pt-20 px-4">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-gray-600">
          {isLogin ? 'Sign in to continue' : 'Start your journey with us'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* ==== GOOGLE SIGN-IN BUTTON - ADD THIS ==== */}
      <div className="mb-6">
        <GoogleSignInButton 
          redirectTo="/"
          onSuccess={() => console.log('Google sign-in successful!')}
          onError={(error) => setError(error.message)}
        />
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            or continue with email
          </span>
        </div>
      </div>
      {/* ==== END GOOGLE SIGN-IN SECTION ==== */}

      {/* Email Form (Your Existing Code) */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Your existing form fields */}
        {!isLogin && (
          <Input
            icon={User}
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required={!isLogin}
          />
        )}

        <Input
          icon={Mail}
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />

        {/* ... rest of your form ... */}

        <Button type="submit" loading={loading} fullWidth>
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      {/* Toggle between sign in/sign up */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-blue-600 hover:text-blue-700"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  </div>
);
```

## Visual Layout

```
┌─────────────────────────────────┐
│       Welcome Back              │
│       Sign in to continue       │
├─────────────────────────────────┤
│                                 │
│  [Continue with Google]         │ ← NEW BUTTON
│                                 │
│      ─── or continue ───        │
│                                 │
│  Name:  [_______________]       │
│  Email: [_______________]       │
│  Pass:  [_______________]       │
│                                 │
│      [Sign In Button]           │
│                                 │
│  Don't have account? Sign up    │
│                                 │
└─────────────────────────────────┘
```

## That's It!

Just add:
1. ✅ The import at the top
2. ✅ The `<GoogleSignInButton />` component in your JSX
3. ✅ (Optional) The divider for visual separation

Save the file and test!

## Testing

```bash
# Start your dev server
npm run dev

# Visit your auth page
# http://localhost:3000/auth

# Click the Google button
# (Won't fully work until Google OAuth is configured)
```

## Next: Configure Google OAuth

After adding the button, follow these guides to configure Google OAuth:

1. **Quick Setup**: See `docs/START_HERE.md`
2. **Detailed Setup**: See `docs/GOOGLE_AUTH_SETUP.md`
3. **Checklist**: See `docs/GOOGLE_AUTH_CHECKLIST.md`

---

**Need help?** Check the other documentation files in the `docs/` folder!
