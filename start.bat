@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo    Truong Hoc Ngoai Ngu - Hoc qua video
echo ============================================
echo.
echo Mo trinh duyet tai: http://127.0.0.1:8000
echo Nhan Ctrl+C trong cua so nay de dung server.
echo.
start "" /min powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:8000'"
".venv\Scripts\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
echo.
echo Server da dung.
pause
