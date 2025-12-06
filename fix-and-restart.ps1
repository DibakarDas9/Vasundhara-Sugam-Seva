Write-Host "========================================" -ForegroundColor Green
Write-Host "  Fixing Vasundhara Docker Issues" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Stopping all containers..." -ForegroundColor Yellow
docker-compose down

Write-Host ""
Write-Host "Cleaning up Docker system..." -ForegroundColor Yellow
docker system prune -f

Write-Host ""
Write-Host "Removing any partial builds..." -ForegroundColor Yellow
docker-compose build --no-cache

Write-Host ""
Write-Host "Starting services with simplified ML service..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Services are starting up!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Check status with: docker-compose ps" -ForegroundColor Cyan
Write-Host "View logs with: docker-compose logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "ML Service: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
