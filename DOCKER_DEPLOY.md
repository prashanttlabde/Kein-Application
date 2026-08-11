# Docker Deployment Guide

## Quick Start

### Build and Run with Docker Compose
```bash
docker-compose up --build
```

### Or Build Manually
```bash
# Build without cache (ensures fresh build)
docker build --no-cache -t kein-app:latest .

# Run the container
docker run -p 3000:3000 --env-file .env.local kein-app:latest
```

### Using PowerShell Script
```powershell
.\docker-build.ps1
```

## Important Notes

1. **Environment Variables**: Make sure `.env.local` exists with all required variables
2. **Clean Build**: Always use `--no-cache` flag to ensure fresh builds with latest code
3. **Port**: The app runs on port 3000 by default

## Troubleshooting

### Build Errors
If you encounter build errors:

1. Clear Docker cache:
   ```bash
   docker system prune -a
   ```

2. Rebuild without cache:
   ```bash
   docker build --no-cache -t kein-app:latest .
   ```

3. Check that all files are up to date:
   ```bash
   git status
   ```

### Common Issues

- **`<Html>` import error**: This has been fixed in `global-error.tsx`. If you still see it, clear Docker cache.
- **Dependency conflicts**: Make sure you're using React 18.3.1 (not React 19)
- **Port already in use**: Stop any running containers or change the port mapping

## Production Deployment

For production, make sure to:

1. Set proper environment variables
2. Use HTTPS/SSL certificates
3. Set up proper logging and monitoring
4. Configure health checks
5. Use a process manager or orchestration tool (K8s, ECS, etc.)
