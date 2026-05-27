@echo off
setlocal EnableDelayedExpansion

echo ========================================
echo   Vasundhara Sugam Seva
echo ========================================
echo.

REM Check if the Docker engine is reachable.
docker info >NUL 2>NUL
if errorlevel 1 (
    echo ERROR: Docker is not reachable.
    echo Please start Docker Desktop and wait until it is fully running, then try again.
    pause
    exit /b 1
)

echo Starting infrastructure services...
docker-compose up -d mongodb redis rabbitmq
if errorlevel 1 (
    echo Failed to start docker services.
    pause
    exit /b 1
)

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >NUL

echo.
echo Starting API service...
call :startNodeService 5000 "Vasundhara API" "vasundhara-api"

echo.
echo Starting ML service...
call :isPortListening 8000
if "%PORT_LISTENING%"=="1" (
    echo ML service is already running on port 8000.
) else (
    start "Vasundhara ML" /D "%CD%\vasundhara-ml" cmd /k "if exist .venv\Scripts\python.exe ((.venv\Scripts\python.exe -m pip show fastapi uvicorn || .venv\Scripts\python.exe -m pip install -r simple_requirements.txt) && .venv\Scripts\python.exe simple_main.py) else (python -m venv .venv && .venv\Scripts\python.exe -m pip install -r simple_requirements.txt && .venv\Scripts\python.exe simple_main.py)"
)

echo.
echo Starting Frontend...
call :startNodeService 3000 "Vasundhara Frontend" "vasundhara-frontend"

echo.
echo Waiting for frontend to be ready...
call :waitForPort 3000 60
if not "%PORT_READY%"=="1" (
    echo Frontend did not become ready on port 3000 within 60 seconds.
    echo Check the "Vasundhara Frontend" command window for errors.
    pause
    exit /b 1
)

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
echo RabbitMQ Management: http://localhost:15672
echo.
start "" "http://localhost:3000"

echo Press any key to exit...
pause >NUL
endlocal
exit /b 0

:startNodeService
set "SERVICE_PORT=%~1"
set "SERVICE_TITLE=%~2"
set "SERVICE_DIR=%~3"
call :isPortListening %SERVICE_PORT%
if "%PORT_LISTENING%"=="1" (
    echo %SERVICE_TITLE% is already running on port %SERVICE_PORT%.
) else (
    start "%SERVICE_TITLE%" /D "%CD%\%SERVICE_DIR%" cmd /k "if exist node_modules (call npm.cmd run dev) else (call npm.cmd install && call npm.cmd run dev)"
)
exit /b 0

:isPortListening
set "PORT_LISTENING=0"
for /f "tokens=1" %%A in ('netstat -ano ^| findstr /R /C:":%~1 .*LISTENING"') do (
    set "PORT_LISTENING=1"
)
exit /b 0

:waitForPort
set "WAIT_PORT=%~1"
set "WAIT_SECONDS=%~2"
set "PORT_READY=0"
for /l %%I in (1,1,%WAIT_SECONDS%) do (
    call :isPortListening %WAIT_PORT%
    if "!PORT_LISTENING!"=="1" (
        set "PORT_READY=1"
        exit /b 0
    )
    timeout /t 1 /nobreak >NUL
)
exit /b 0
