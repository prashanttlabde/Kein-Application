# Integration Guide: Adding Google Sign-In to Your Existing Pages

This guide shows you **exactly** where and how to add the Google Sign-In button to your existing authentication pages.

## 🎯 Quick Integration

### Option 1: Replace Your Entire Auth Page

If you want a complete, ready-to-use sign-in page:

```bash
# Use the example page we created
# Just navigate to: http://localhost:3000/auth/signin
```

The page at `app/auth/signin/page.tsx` is production-ready!

### Option 2: Add to Existing Auth Page

Find your existing auth page and add the Google button component:

```tsx
// Your existing auth page (e.g., app/auth/page.tsx or app/login/page.tsx)
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'  // ADD THIS

export default function AuthPage() {
  return (
    <div>
      <h1>Sign In</h1>
      
      {/* ADD THE GOOGLE BUTTON HERE */}
      <GoogleSignInButton redirectTo="/dashboard" />
      
      {/* Your existing sign-in form */}
      <form>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Sign In</button>
      </form>
    </div>
  )
}
```

### Option 3: Add to Modal/Popup

If you use a modal for authentication:

```tsx
'use client'

import { useState } from 'react'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Sign In</h2>
        
        {/* Google Sign-In Button */}
        <GoogleSignInButton 
          redirectTo="/dashboard"
          onSuccess={onClose}
        />
        
        <div className="divider">or</div>
        
        {/* Your other auth methods */}
        <form>{/* ... */}</form>
      </div>
    </div>
  )
}
```

### Option 4: Add to Navbar

For a sign-in button in your navigation:

```tsx
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { useAuthContext } from '@/contexts/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user } = useAuthContext()

  return (
    <nav>
      {!isAuthenticated ? (
        <GoogleSignInButton redirectTo="/dashboard" />
      ) : (
        <div>Welcome, {user?.email}</div>
      )}
    </nav>
  )
}
```

## 🎨 Common Layouts

### Layout 1: Centered Sign-In Page

```tsx
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function SignIn() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        maxWidth: '400px', 
        padding: '40px', 
        background: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1>Welcome Back</h1>
        <GoogleSignInButton redirectTo="/dashboard" />
      </div>
    </div>
  )
}
```

### Layout 2: Side-by-Side with Form

```tsx
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function SignIn() {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <h2>Social Sign-In</h2>
        <GoogleSignInButton redirectTo="/dashboard" />
      </div>
      
      <div className="divider">OR</div>
      
      <div className="auth-right">
        <h2>Email Sign-In</h2>
        <form>{/* Your form */}</form>
      </div>
    </div>
  )
}
```

### Layout 3: Stacked Options

```tsx
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function SignIn() {
  return (
    <div className="auth-page">
      <h1>Sign In to Keinshop</h1>
      
      {/* Social login options */}
      <div className="social-buttons">
        <GoogleSignInButton redirectTo="/dashboard" />
        {/* Add more providers here */}
      </div>
      
      {/* Divider */}
      <div className="divider">
        <span>or continue with email</span>
      </div>
      
      {/* Email form */}
      <form>{/* Your form */}</form>
    </div>
  )
}
```

## 📝 Styling Examples

### Example 1: Full Width Button

```tsx
<div style={{ width: '100%', maxWidth: '400px' }}>
  <GoogleSignInButton redirectTo="/dashboard" />
</div>
```

### Example 2: Multiple Buttons

```tsx
<div style={{ 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '12px',
  width: '100%' 
}}>
  <GoogleSignInButton redirectTo="/dashboard" />
  {/* Add more OAuth providers */}
</div>
```

### Example 3: With Custom Container

```tsx
<div className="auth-buttons-container">
  <GoogleSignInButton redirectTo="/dashboard" />
</div>

<style jsx>{`
  .auth-buttons-container {
    max-width: 400px;
    margin: 20px auto;
    padding: 20px;
  }
`}</style>
```

## 🔧 Props Reference

### GoogleSignInButton Props

```typescript
interface GoogleSignInButtonProps {
  redirectTo?: string           // Where to redirect after sign-in
  onSuccess?: () => void        // Called on successful sign-in
  onError?: (error: Error) => void  // Called on error
}
```

### Usage Examples

**Basic**:
```tsx
<GoogleSignInButton />
```

**With redirect**:
```tsx
<GoogleSignInButton redirectTo="/profile" />
```

**With callbacks**:
```tsx
<GoogleSignInButton 
  redirectTo="/dashboard"
  onSuccess={() => {
    console.log('User signed in!')
    // Track analytics, show notification, etc.
  }}
  onError={(error) => {
    console.error('Sign in failed:', error)
    // Show error message to user
  }}
/>
```

## 🎯 Where to Add It

Based on your project structure, add the Google button to these files:

### Likely Locations in Your Project:

1. **Auth/Login Page**: 
   - `app/auth/page.tsx`
   - `app/login/page.tsx`
   - `app/signin/page.tsx`

2. **Account Pages**:
   - `app/account/page.tsx`
   - `app/profile/page.tsx`

3. **Navigation**:
   - `components/Navbar.tsx`
   - `components/Header.tsx`
   - `components/MobileNavigation.tsx`

4. **Modals**:
   - `components/AuthModal.tsx`
   - `components/LoginModal.tsx`

## 🚀 Quick Start Commands

1. **Find your auth pages**:
   ```bash
   # Search for existing auth pages
   find app -name "*auth*.tsx" -o -name "*login*.tsx" -o -name "*signin*.tsx"
   ```

2. **Add the import**:
   ```tsx
   import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
   ```

3. **Use the component**:
   ```tsx
   <GoogleSignInButton redirectTo="/dashboard" />
   ```

4. **Test it**:
   ```bash
   npm run dev
   # Visit your auth page
   ```

## ✅ Checklist

After adding the button:

- [ ] Imported `GoogleSignInButton` component
- [ ] Added button to your auth page/modal
- [ ] Set `redirectTo` prop to your desired page
- [ ] Tested the button click
- [ ] Verified redirect works after Google auth
- [ ] Styled container if needed
- [ ] Tested on mobile viewport

## 🎨 Customization Tips

### Tip 1: Match Your Brand
Wrap the button in a container with your brand styling:

```tsx
<div className="my-auth-container">
  <GoogleSignInButton redirectTo="/dashboard" />
</div>
```

### Tip 2: Add Other OAuth Providers
Stack multiple providers:

```tsx
<div className="social-auth">
  <GoogleSignInButton redirectTo="/dashboard" />
  {/* Add Facebook, GitHub, etc. */}
</div>
```

### Tip 3: Mobile-Friendly
The button is already responsive, but ensure your container is too:

```css
.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 0 16px;
  margin: 0 auto;
}
```

## 🆘 Need Help?

- **Can't find your auth pages?** Check `app/auth/`, `app/login/`, or `pages/` directories
- **Button not showing?** Check browser console for import errors
- **Styling issues?** Wrap button in a container and apply custom CSS
- **Not redirecting?** Verify the `redirectTo` path exists in your app

---

**Ready to integrate?** Pick one of the options above and start adding Google Sign-In to your app! 🚀
