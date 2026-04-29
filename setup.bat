@echo off
setlocal enabledelayedexpansion
title AI Job Portal - Auto Setup
color 0A

echo.
echo  ============================================================
echo     AI Job Portal - One-Click Setup
echo  ============================================================
echo.

REM ── Check Node.js ──────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed.
    echo          Download it from: https://nodejs.org/
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  [OK] Node.js found: %NODE_VER%

REM ── Check Python ───────────────────────────────────────────────
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Python is not installed.
    echo          Download it from: https://python.org/
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('python --version') do set PY_VER=%%v
echo  [OK] Python found: %PY_VER%

REM ── Check Git ──────────────────────────────────────────────────
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo  [WARN] Git not found. Skipping git check.
) else (
    echo  [OK] Git found.
)

echo.
echo  ── Step 1/4: Installing Backend dependencies ────────────────
cd /d "%~dp0backend"
call npm install --silent
if %errorlevel% neq 0 (
    echo  [ERROR] Backend npm install failed!
    pause & exit /b 1
)
echo  [OK] Backend dependencies installed.

echo.
echo  ── Step 2/4: Installing Frontend dependencies ───────────────
cd /d "%~dp0frontend"
call npm install --silent
if %errorlevel% neq 0 (
    echo  [ERROR] Frontend npm install failed!
    pause & exit /b 1
)
echo  [OK] Frontend dependencies installed.

echo.
echo  ── Step 3/4: Installing AI Service (Python) dependencies ────
cd /d "%~dp0ai-service"
python -m pip install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo  [ERROR] Python pip install failed!
    pause & exit /b 1
)
echo  [OK] Python AI service dependencies installed.

echo.
echo  ── Step 4/4: Creating backend .env file ─────────────────────
cd /d "%~dp0backend"
if not exist ".env" (
    (
        echo # ── Sarvam AI Configuration ──────────────────────────────────
        echo # The API key is pre-configured. No changes needed.
        echo SARVAM_API_KEY=sk_xs5dbt92_YCfO5S7AF3b9DIQxznmH8tao
        echo.
        echo # ── Authentication ────────────────────────────────────────────
        echo # Change this to any random secret string in production
        echo JWT_SECRET=ai-job-portal-jwt-secret-2024
        echo.
        echo # ── Server ────────────────────────────────────────────────────
        echo PORT=5000
    ) > .env
    echo  [OK] backend/.env created with default configuration.
) else (
    echo  [SKIP] backend/.env already exists. Not overwriting.
)

echo.
echo  ============================================================
echo   Setup Complete!  Everything is ready.
echo  ============================================================
echo.
echo   Next step: Double-click  start-all.bat  to launch the app.
echo.
echo   App URLs once started:
echo     Frontend  -^>  http://localhost:5173
echo     Backend   -^>  http://localhost:5000
echo     AI Agent  -^>  http://localhost:8000
echo.
pause
