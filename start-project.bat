@echo off
echo ========================================
echo   Vasundhara - Smart Food Waste Management
echo ========================================
echo.

echo Starting infrastructure services...
docker-compose up -d mongodb redis rabbitmq

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak > nul

echo.
echo Starting API service...
cd vasundhara-api
start "Vasundhara API" cmd /k "npm install && npm run dev"
cd ..

echo.
echo Starting ML service...
cd vasundhara-ml
start "Vasundhara ML" cmd /k "pip install -r simple_requirements.txt && python simple_main.py"
cd ..

echo.
echo Starting Frontend...
cd vasundhara-frontend
start "Vasundhara Frontend" cmd /k "npm install && npm run dev"
cd ..

echo.
echo ========================================
echo   All services are starting up!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo API: http://localhost:5000
echo ML Service: http://localhost:8000
echo MongoDB: localhost:27017
echo Redis: localhost:6379
echo.
start "" "http://localhost:3000"
echo Press any key to exit...
pause > nul
