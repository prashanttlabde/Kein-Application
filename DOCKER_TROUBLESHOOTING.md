# Docker Build Troubleshooting Guide

## The Problem
You're seeing this error in Docker builds (but not locally):
```
Error: <Html> should not be imported outside of pages/_document.
```

## Why This Happens
- ✅ Your code is **correct** (local build works)
- ❌ Docker is using **cached dependencies** with old React 19 versions
- The cache includes `node_modules` with React 19, which conflicts with `@100mslive/react-sdk`

## Solutions (Try in Order)

### Solution 1: Use the Clean Build Script (RECOMMENDED)
```powershell
.\docker-build.ps1
```

This script:
- Cleans local `.next` directory
- Prunes Docker build cache
- Removes old images
- Builds with `--no-cache` flag

### Solution 2: Manual Clean Build
```powershell
# Step 1: Clean Docker
docker builder prune -a -f
docker system prune -a -f

# Step 2: Build without any cache
docker build --no-cache --pull -t kein-app:latest .
```

### Solution 3: Use Ultra-Clean Dockerfile
If the main Dockerfile still fails:
```powershell
docker build --no-cache -f Dockerfile.clean -t kein-app:latest .
```

### Solution 4: Nuclear Option (If all else fails)
```powershell
# Remove ALL Docker data (WARNING: This removes all images and containers)
docker system prune -a --volumes -f

# Rebuild
docker build --no-cache -t kein-app:latest .
```

## Verify Your Local Environment First

Before building with Docker, always verify:

```powershell
# Check your package.json has React 18
cat package.json | Select-String "react"
# Should show: "react": "^18.3.1"

# Verify local build works
npm run build
# Should complete successfully

# Check no node_modules in Docker context
ls .dockerignore
# Should include: node_modules, package-lock.json, .next
```

## Understanding the Issue

Your `package.json` should have:
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@100mslive/react-sdk": "^0.10.39"
  }
}
```

The Docker build was failing because:
1. Old `package-lock.json` in cache had React 19
2. Docker cached the `npm ci` layer with React 19
3. React 19 + `@100mslive/react-sdk` = conflict

## Prevention

To prevent this in the future:

1. **Always build with `--no-cache`** when package.json changes
2. **Add package-lock.json to .dockerignore** (already done)
3. **Use the build script** which handles cleanup automatically

## Quick Reference

| Command | Use Case |
|---------|----------|
| `.\docker-build.ps1` | Recommended clean build |
| `docker build --no-cache .` | Quick clean build |
| `docker builder prune -f` | Clear build cache |
| `docker system prune -a -f` | Clear everything |

## Still Not Working?

If you're still seeing the error after trying all solutions:

1. Check if you're building in CI/CD (GitHub Actions, etc.)
   - Make sure CI doesn't have cached layers
   - Add `--no-cache` to CI build commands

2. Verify Docker Desktop is up to date
   ```powershell
   docker --version
   # Should be recent version
   ```

3. Check available disk space
   ```powershell
   Get-PSDrive C
   # Should have several GB free
   ```

4. Try building on a different machine/environment to rule out local issues

## Success Indicators

You'll know it worked when:
- ✅ Build completes without errors
- ✅ Shows "Generating static pages (93/93)"
- ✅ Creates `kein-app:latest` image
- ✅ Container runs successfully on port 3000
