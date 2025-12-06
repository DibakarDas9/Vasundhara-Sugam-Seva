@echo off
echo ========================================
echo   Fixing Vasundhara Docker Issues
echo ========================================
echo.

echo Stopping all containers...
docker-compose down

echo.
echo Cleaning up Docker system...
docker system prune -f

echo.
echo Removing any partial builds...
docker-compose build --no-cache

echo.
echo Starting services with simplified ML service...
docker-compose up -d

echo.
echo ========================================
echo   Services are starting up!
echo ========================================
echo.
echo Check status with: docker-compose ps
echo View logs with: docker-compose logs
echo.
echo Frontend: http://localhost:3000
echo API: http://localhost:5000
echo ML Service: http://localhost:8000
echo.
pause
