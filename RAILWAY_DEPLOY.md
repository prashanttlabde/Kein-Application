# Railway Deployment Guide

## The Issue
Railway is caching old dependencies with React 19, causing the build to fail with:
```
Error: <Html> should not be imported outside of pages/_document.
```

## Quick Fix (Force Railway to Rebuild)

### Option 1: Via Railway Dashboard (RECOMMENDED)
1. Go to your Railway project
2. Click on **Settings** → **Danger Zone**
3. Click **Clear Build Cache**
4. Go back to **Deployments**
5. Click **Redeploy** on the latest deployment

### Option 2: Force Push to Trigger Rebuild
```bash
git commit --allow-empty -m "Force Railway rebuild"
git push origin master
```

### Option 3: Delete and Recreate Service
If the above doesn't work:
1. Delete the service in Railway
2. Recreate it from the same repository
3. This ensures a completely fresh environment

## Configuration Files Added

### 1. `railway.toml`
Tells Railway how to build and deploy:
```toml
[build]
builder = "NIXPACKS"

[build.env]
NODE_ENV = "production"
NEXT_TELEMETRY_DISABLED = "1"

[deploy]
startCommand = "npm start"
```

### 2. `.npmrc`
Forces npm to handle peer dependencies correctly:
```
legacy-peer-deps=true
```

## Environment Variables

Make sure these are set in Railway dashboard:

### Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Optional:
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`

## Verify Deployment

After deployment succeeds, check:

1. **Build Logs** should show:
   ```
   ✓ Generating static pages (93/93)
   ✓ Build completed successfully
   ```

2. **Deployment URL** should load without errors

3. **No 404 errors** on valid routes

## Troubleshooting

### Build Still Fails After Cache Clear?

1. **Check package.json** is committed with React 18:
   ```json
   {
     "dependencies": {
       "react": "^18.3.1",
       "react-dom": "^18.3.1"
     }
   }
   ```

2. **Ensure .npmrc is committed**:
   ```bash
   git add .npmrc railway.toml
   git commit -m "Add Railway config"
   git push
   ```

3. **Check Railway logs** for specific errors:
   - Go to your deployment
   - Click **View Logs**
   - Look for npm install errors

### React Version Conflicts?

If Railway shows it's installing React 19:

1. Delete `package-lock.json` locally:
   ```bash
   rm package-lock.json
   ```

2. Clean install:
   ```bash
   npm install
   ```

3. Commit and push:
   ```bash
   git add package.json package-lock.json
   git commit -m "Fix React version"
   git push
   ```

## Railway-Specific Tips

1. **Always clear cache** when changing dependencies
2. **Don't commit node_modules** (already in .gitignore)
3. **Use Railway's environment variables** for secrets
4. **Check build time** - should be 2-5 minutes for clean builds
5. **Watch memory usage** - Next.js builds can use 2GB+

## Success Indicators

Your deployment works when:
- ✅ Build completes in 2-5 minutes
- ✅ Shows "Generating static pages (93/93)"
- ✅ App loads at Railway URL
- ✅ No console errors in browser
- ✅ All routes work correctly

## Need Help?

If you're still stuck:
1. Check Railway's status page: https://railway.statuspage.io/
2. Railway Discord: https://discord.gg/railway
3. Share your build logs (remove any secrets)
