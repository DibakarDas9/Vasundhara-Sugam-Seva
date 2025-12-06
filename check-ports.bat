@echo off
echo ========================================
echo   Checking Port Usage
echo ========================================
echo.

echo Checking port 3000 (Frontend)...
netstat -ano | findstr :3000
echo.

echo Checking port 5000 (Old API)...
netstat -ano | findstr :5000
echo.

echo Checking port 5001 (New API)...
netstat -ano | findstr :5001
echo.

echo Checking port 8000 (ML Service)...
netstat -ano | findstr :8000
echo.

echo ========================================
echo   Port Check Complete
echo ========================================
echo.
echo If you see any processes using these ports,
echo you can kill them with: taskkill /PID <PID> /F
echo.
pause
