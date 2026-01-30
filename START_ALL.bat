@echo off
echo ================================================
echo     SLINGSHOT NEWS - STARTUP SCRIPT
echo ================================================
echo.

:: Start Grok API Server (Primary Translation)
echo [1/3] Starting Grok API Server (port 6969)...
start "Grok API Server" cmd /k "cd /d %~dp0Grok-Api && python api_server.py"
timeout /t 3 /nobreak > nul

:: Start Backend Server
echo [2/3] Starting Backend Server (port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 5 /nobreak > nul

:: Start Frontend Server
echo [3/3] Starting Frontend Server (port 3000)...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ================================================
echo     ALL SERVICES STARTED!
echo ================================================
echo.
echo Grok API:    http://localhost:6969
echo Backend:     http://localhost:5000
echo API Docs:    http://localhost:5000/api-docs
echo Frontend:    http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
