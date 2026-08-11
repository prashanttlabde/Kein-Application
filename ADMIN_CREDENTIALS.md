# Admin User Credentials

## Current Admin User

### Login Credentials

**Email:** `maheshkumawat0304@gmail.com`  
**Password:** `KeinAdmin2024!`  
**Security Key:** *Required from database `admin_users` table*

### Authentication Method

The admin portal uses **triple authentication**:
1. Email address
2. Password
3. Security Key (stored in database)

### Admin Portal URLs

**Development:**
```
http://localhost:3000/admin-portal
```

**Sign In Page:**
```
http://localhost:3000/admin-portal/auth/signin
```

## How to Sign In

1. Navigate to the admin sign-in page
2. Enter email: `maheshkumawat0304@gmail.com`
3. Enter password: `KeinAdmin2024!`
4. Enter security key (get from database - see below)
5. Click "Sign In"

## Getting the Security Key

### Option 1: Query Database Directly

```sql
SELECT id, email, full_name, security_key, is_active, last_login
FROM admin_users
WHERE email = 'maheshkumawat0304@gmail.com'
  AND is_active = true;
```

### Option 2: Use Supabase Dashboard

1. Go to https://app.supabase.com/project/eafxupeakpgpypxczvxk
2. Click "Table Editor" in sidebar
3. Find and open `admin_users` table
4. Look for the row with email `maheshkumawat0304@gmail.com`
5. Copy the `security_key` value

## Creating a New Admin User

If the admin user doesn't exist in the database, you need to create one:

### SQL Insert Statement

```sql
INSERT INTO admin_users (
  id,
  email,
  full_name,
  security_key,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'maheshkumawat0304@gmail.com',
  'Mahesh Kumawat',
  'KEIN-ADMIN-2024-SECURE',  -- Change this to a secure random key
  true,
  now(),
  now()
);
```

### Generate Security Key

For production, use a strong random security key:

```javascript
// In browser console or Node.js:
crypto.randomUUID() + '-' + Date.now()
// Example output: '550e8400-e29b-41d4-a716-446655440000-1699584000000'
```

## Database Table Structure

The `admin_users` table should have:

```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  security_key TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_security_key ON admin_users(security_key);

-- Enable RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading (since we use service role, this is optional)
CREATE POLICY "Allow admin read" ON admin_users
  FOR SELECT
  USING (true);
```

## Session Management

- **Session Duration:** 24 hours
- **Storage:** Browser localStorage (key: `admin_session`)
- **Auto-logout:** Sessions expire after 24 hours
- **Manual logout:** Available in admin portal

### Session Data Structure

```json
{
  "id": "uuid-of-admin",
  "email": "maheshkumawat0304@gmail.com",
  "full_name": "Mahesh Kumawat",
  "loginTime": "2025-11-10T10:30:00.000Z"
}
```

## Security Features

✅ **Triple Authentication:** Email + Password + Security Key  
✅ **Active Status Check:** Only active admins can sign in  
✅ **Session Timeout:** 24-hour automatic expiration  
✅ **Last Login Tracking:** Monitors admin access  
✅ **Input Sanitization:** Trims whitespace from inputs  
✅ **Error Logging:** Comprehensive console logging  

## Troubleshooting

### "Invalid admin credentials or security key"

**Causes:**
1. Wrong email address
2. Wrong security key
3. Admin user doesn't exist in database
4. Admin user is inactive (`is_active = false`)

**Solutions:**
1. Verify email is exactly: `maheshkumawat0304@gmail.com`
2. Query database for correct security key
3. Create admin user if doesn't exist (see SQL above)
4. Ensure `is_active = true` in database

### "Invalid password"

**Cause:** Wrong password entered

**Solution:** Use password: `KeinAdmin2024!`

### Session Expired

**Cause:** Logged in more than 24 hours ago

**Solution:** Sign in again with email, password, and security key

### Can't Access Admin Portal

**Cause:** Not signed in or session expired

**Solutions:**
1. Navigate to sign-in page
2. Enter credentials
3. Check browser console for errors
4. Verify database connection

## Quick Setup Script

If you need to quickly set up an admin user, run this in Supabase SQL editor:

```sql
-- Check if admin user exists
SELECT * FROM admin_users 
WHERE email = 'maheshkumawat0304@gmail.com';

-- If not exists, create one
INSERT INTO admin_users (email, full_name, security_key, is_active)
VALUES (
  'maheshkumawat0304@gmail.com',
  'Mahesh Kumawat',
  'KEIN-ADMIN-2024-' || gen_random_uuid(),
  true
)
ON CONFLICT (email) DO NOTHING
RETURNING *;

-- Show the security key
SELECT email, security_key, is_active, created_at 
FROM admin_users 
WHERE email = 'maheshkumawat0304@gmail.com';
```

## Password Change (Future)

**Note:** Currently, the password is hardcoded in `lib/adminAuth.ts`. For production:

1. Implement password hashing (bcrypt or argon2)
2. Store hashed password in database
3. Add password reset functionality
4. Remove hardcoded passwords from code

### Current Password Location

File: `lib/adminAuth.ts` (Line 56-58)

```typescript
const validPasswords = {
  'maheshkumawat0304@gmail.com': 'KeinAdmin2024!'
};
```

## Admin Capabilities

Once signed in, admin users can:

✅ View and manage all users  
✅ Verify creators and sellers  
✅ Manage products and content  
✅ View analytics and reports  
✅ Handle verification requests  
✅ Manage contracts  
✅ Assign live streaming credentials  
✅ Monitor system health  

## Important Notes

⚠️ **Security Warning:** 
- Never commit security keys to Git
- Never share security keys via email/chat
- Store admin credentials securely (password manager)
- Rotate security keys periodically

⚠️ **Production Recommendations:**
- Implement proper password hashing
- Add two-factor authentication (2FA)
- Use environment variables for sensitive data
- Implement audit logging for admin actions
- Add IP whitelisting for admin access
- Use HTTPS only

## Support

If you need help with admin access:
1. Check this documentation
2. Verify database connection
3. Check browser console for errors
4. Review server logs in terminal
5. Ensure Supabase is accessible
