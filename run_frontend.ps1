Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Starting SmartCart React Vite Frontend (Port 5173)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend"
npm.cmd run dev
