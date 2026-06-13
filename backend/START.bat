@echo off
echo ========================================
echo    HomeBot AI - Starting Application
echo ========================================
echo.
echo Step 1: Starting Flask backend...
start "Flask Backend" cmd /k "cd /d C:\Users\Debolina\OneDrive\Desktop\homebot-ai && conda activate homebot && python backend/app.py"
echo.
echo Waiting 3 seconds for Flask to start...
timeout /t 3 /nobreak > nul
echo.
echo Step 2: Starting React frontend...
start "React Frontend" cmd /k "cd /d C:\Users\Debolina\OneDrive\Desktop\homebot-ai\frontend && npm start"
echo.
echo ========================================
echo    Both servers starting!
echo    App:   http://localhost:3000
echo    Admin: http://localhost:3000/admin
echo    API:   http://127.0.0.1:5000
echo ========================================
pause