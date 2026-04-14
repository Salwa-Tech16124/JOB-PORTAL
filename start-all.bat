@echo off
echo =========================================
echo    Starting AI Job Portal Services...
echo =========================================

echo 1. Starting Python AI Service (Port 8000)...
start "AI Service" cmd /k "cd ai-service && python -m uvicorn main:app --reload --port 8000"

echo 2. Starting Node.js Backend (Port 5000)...
start "Node Backend" cmd /k "cd backend && npm start"

echo 3. Starting React Frontend (Port 5173)...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All services have been launched in separate windows!
echo You can close this window now.
