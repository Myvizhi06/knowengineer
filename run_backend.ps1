Write-Host "========================================================" -ForegroundColor Green
Write-Host " Starting SmartCart FastAPI Backend Server (Port 8000)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\backend"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
