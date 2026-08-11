# Clean Docker build script for Kein App
# This ensures a completely fresh build without any cache

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Kein App - Clean Docker Build" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean up local artifacts
Write-Host "[1/5] Cleaning local build artifacts..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "  ✓ Removed .next directory" -ForegroundColor Green
}

# Step 2: Prune Docker system
Write-Host ""
Write-Host "[2/5] Pruning Docker build cache..." -ForegroundColor Yellow
docker builder prune -f
Write-Host "  ✓ Docker build cache cleared" -ForegroundColor Green

# Step 3: Remove old images
Write-Host ""
Write-Host "[3/5] Removing old Kein app images..." -ForegroundColor Yellow
docker images | Select-String "kein-app" | ForEach-Object {
    $imageId = ($_ -split '\s+')[2]
    docker rmi -f $imageId 2>$null
}
Write-Host "  ✓ Old images removed" -ForegroundColor Green

# Step 4: Build without cache
Write-Host ""
Write-Host "[4/5] Building Docker image (no cache)..." -ForegroundColor Yellow
Write-Host "  This may take several minutes..." -ForegroundColor Gray
docker build --no-cache --progress=plain -t kein-app:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[5/5] Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "  Build Complete! ✓" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To run the container:" -ForegroundColor Yellow
    Write-Host "  docker run -p 3000:3000 --env-file .env.local kein-app:latest" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use docker-compose:" -ForegroundColor Yellow
    Write-Host "  docker-compose up" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Red
    Write-Host "  Build Failed! ✗" -ForegroundColor Red
    Write-Host "======================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Make sure Docker Desktop is running" -ForegroundColor White
    Write-Host "  2. Check that .env.local exists with required variables" -ForegroundColor White
    Write-Host "  3. Ensure you have enough disk space" -ForegroundColor White
    Write-Host ""
    exit 1
}
