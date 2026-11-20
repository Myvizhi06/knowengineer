@echo off
echo ========================================================
echo  Starting SmartCart Full-Stack Supermarket System
echo ========================================================
echo 1. Launching Backend Server on http://localhost:8000 ...
start "SmartCart Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo 2. Launching Frontend Server on http://localhost:5173 ...
start "SmartCart Frontend (React Vite)" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo Both servers started in separate terminal windows!
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:8000
echo - Swagger API Docs: http://localhost:8000/docs
echo ========================================================
pause
