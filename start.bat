@echo off
title Starlet Directory VIP Launcher
chcp 65001 >nul
echo =========================================================================================
echo   Starlet Directory — VIP Framer Motion ^& Vite Edition
echo =========================================================================================
echo.
echo Opening Starlet Directory VIP Edition in default browser...
start http://localhost:8000/
echo.
echo  💻 PC Local Access  : http://localhost:8000/
echo  📱 Mobile Wi-Fi URL : http://192.173.2.107:8000/
echo.
echo  * If your phone cannot connect, run ALLOW_PHONE_ACCESS.bat as Administrator.
echo.
echo Press Ctrl+C in this window to stop the server.
echo.
node server.mjs
if %ERRORLEVEL% NEQ 0 (
  echo Node.js error, falling back to python server...
  python -m http.server 8000
)
pause
