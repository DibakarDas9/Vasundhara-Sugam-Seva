Write-Host "========================================" -ForegroundColor Green
Write-Host "  Vasundhara - Smart Food Waste Management" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
docker-compose up -d mongodb redis rabbitmq

Write-Host ""
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Starting API service..." -ForegroundColor Yellow
Set-Location vasundhara-api
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm install; npm run dev"
Set-Location ..

Write-Host ""
Write-Host "Starting ML service..." -ForegroundColor Yellow
Set-Location vasundhara-ml
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pip install -r simple_requirements.txt; python simple_main.py"
Set-Location ..

Write-Host ""
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Set-Location vasundhara-frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm install; npm run dev"
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All services are starting up!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "ML Service: http://localhost:8000" -ForegroundColor Cyan
Write-Host "MongoDB: localhost:27017" -ForegroundColor Cyan
Write-Host "Redis: localhost:6379" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
