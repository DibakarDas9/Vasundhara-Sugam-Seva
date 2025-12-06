@echo off
echo ========================================
echo   Vasundhara Local Setup
echo ========================================
echo.

echo Installing Python dependencies...
pip install fastapi uvicorn pydantic python-multipart python-dotenv

echo.
echo Installing Node.js dependencies...
cd vasundhara-api
call npm install
cd ..

cd vasundhara-frontend
call npm install
cd ..

echo.
echo Starting infrastructure services...
docker-compose up -d mongodb redis rabbitmq

echo.
echo Waiting for services to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting API service...
cd vasundhara-api
start "Vasundhara API" cmd /k "npm run dev"
cd ..

echo.
echo Starting ML service...
cd vasundhara-ml
start "Vasundhara ML" cmd /k "python simple_main.py"
cd ..

echo.
echo Starting Frontend...
cd vasundhara-frontend
start "Vasundhara Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo   All services are starting up!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo API: http://localhost:5001
echo ML Service: http://localhost:8000
echo.
echo Press any key to exit...
pause > nul
