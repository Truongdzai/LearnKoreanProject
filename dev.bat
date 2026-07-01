@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo    CHE DO DEV - Tu dong cap nhat khi sua code
echo ============================================
echo.
echo 1. Dam bao server backend dang chay (mo start.bat o cua so khac).
echo 2. Mo trinh duyet tai dia chi Vite hien ben duoi (vd: http://127.0.0.1:5173).
echo 3. Cu sua code va luu - trang se tu cap nhat, KHONG can build lai.
echo.
call npm run dev --prefix frontend
pause
