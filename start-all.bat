@echo off
setlocal enabledelayedexpansion
title AI Job Portal - Starting Services
color 0A

echo.
echo  ============================================================
echo     AI Job Portal - Starting All Services
echo  ============================================================
echo.

REM ── Kill anything already on these ports ──────────────────────
for %%p in (5000 5173 8000) do (
    for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%%p.*LISTENING"') do (
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo  [1/3] Starting AI Service (Python)    -> http://localhost:8000
start "AI Service  :8000" cmd /k "cd /d "%~dp0ai-service" && python -m uvicorn main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo  [2/3] Starting Backend (Node.js)      -> http://localhost:5000
start "Backend     :5000" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 2 /nobreak >nul

echo  [3/3] Starting Frontend (React/Vite)  -> http://localhost:5173
start "Frontend    :5173" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  ============================================================
echo   All services launched in separate windows!
echo.
echo   Open your browser at:  http://localhost:5173
echo  ============================================================
echo.
timeout /t 5 /nobreak >nul
start http://localhost:5173
