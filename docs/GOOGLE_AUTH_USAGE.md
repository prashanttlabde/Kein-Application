# Quick Start: Adding Google Sign-In to Your Pages

## Using the Google Sign-In Button

The Google Sign-In button component is ready to use. Here's how to add it to your pages:

### Basic Usage

```tsx
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function YourPage() {
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
/>
```

### With Event Handlers

```tsx
<GoogleSignInButton 
  redirectTo="/profile"
  onSuccess={() => {
    console.log('User signed in successfully!')
    // Optional: Show success message, track analytics, etc.
  }}
  onError={(error) => {
    console.error('Sign in failed:', error)
    // Optional: Show error message to user
  }}
/>
```

## Example Pages

### 1. Add to Existing Auth Page

If you have an existing auth page at `app/auth/page.tsx`:

```tsx
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function AuthPage() {
  return (
    <div className="auth-container">
      <h1>Welcome to Keinshop</h1>
      
      {/* Add the Google button */}
      <GoogleSignInButton redirectTo="/dashboard" />
      
      {/* Your other auth methods */}
      <div className="divider">or</div>
      <button>Sign in with Email</button>
    </div>
  )
}
```

### 2. Add to Navbar/Header

```tsx
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { useAuthContext } from '@/contexts/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user } = useAuthContext()

  return (
    <nav>
      <div className="logo">Keinshop</div>
      <div className="auth-section">
        {!isAuthenticated ? (
          <GoogleSignInButton redirectTo="/dashboard" />
        ) : (
          <div>Welcome, {user?.email}</div>
        )}
      </div>
    </nav>
  )
}
```

### 3. Add to Landing Page

```tsx
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <h1>Start Shopping Today</h1>
        <p>Join thousands of happy customers</p>
        <GoogleSignInButton redirectTo="/explore" />
      </section>
    </main>
  )
}
```

## Styling the Button

The button comes with default Google-style styling, but you can wrap it in a container for custom positioning:

```tsx
<div style={{ maxWidth: '300px', margin: '20px auto' }}>
  <GoogleSignInButton />
</div>
```

Or use CSS classes:

```tsx
<div className="auth-buttons-container">
  <GoogleSignInButton />
</div>
```

```css
.auth-buttons-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  margin: 0 auto;
}
```

## Complete Example - Modal Sign In

```tsx
'use client'

import { useState } from 'react'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function SignInModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Sign In</button>
      
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
            
            <h2>Sign In to Keinshop</h2>
            <p>Continue with your Google account</p>
            
            <GoogleSignInButton 
              redirectTo="/dashboard"
              onSuccess={() => setIsOpen(false)}
              onError={(error) => {
                alert(`Failed to sign in: ${error.message}`)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
```

## Next Steps

After adding the button, make sure to:

1. Configure Google OAuth in Google Cloud Console
2. Enable Google provider in Supabase Dashboard
3. Set up environment variables
4. Test the authentication flow

See `GOOGLE_AUTH_SETUP.md` for detailed setup instructions.
