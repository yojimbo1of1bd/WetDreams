@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Starlet Directory - Mobile Wi-Fi & Firewall Setup
color 0A

echo =========================================================================================
echo   STARLET DIRECTORY VIP - MOBILE ACCESS ^& WINDOWS FIREWALL SETUP
echo =========================================================================================
echo.

:: Check for administrative permissions
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Requesting Administrator privileges to configure Windows Defender Firewall...
    echo.
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo [+] Running with Administrator privileges.
echo [+] Adding Windows Defender Firewall inbound rule for TCP Port 8000...
echo.

netsh advfirewall firewall delete rule name="Starlet VIP Server (Port 8000)" >nul 2>&1
netsh advfirewall firewall add rule name="Starlet VIP Server (Port 8000)" dir=in action=allow protocol=TCP localport=8000 profile=any >nul

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Port 8000 is now OPEN in Windows Defender Firewall!
) else (
    echo [ERROR] Failed to add firewall rule. Please check your antivirus or group policy.
)

echo.
echo =========================================================================================
echo   HOW TO CONNECT FROM YOUR MOBILE PHONE:
echo =========================================================================================
echo.
echo   1. Ensure your phone is connected to the SAME Wi-Fi network as this PC.
echo      (Turn OFF Mobile Data / 4G / 5G on your phone while testing)
echo.
echo   2. Open Chrome or Safari on your phone and go to:
echo.
echo        http://192.173.2.107:8000
echo.
echo      (Be sure to type "http://" and NOT "https://")
echo.
echo =========================================================================================
echo.
pause

