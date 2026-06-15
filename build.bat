@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Building giao dien React...
call npm run build --prefix frontend
echo.
echo Xong. Chay start.bat de mo app.
pause
