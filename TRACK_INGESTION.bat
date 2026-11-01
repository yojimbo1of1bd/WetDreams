@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Starlet Directory - Live Ingestion Monitor
color 0A
mode con cols=115 lines=38

echo ===================================================================================================
echo    STARLET DIRECTORY VIP - LIVE INGESTION MONITOR ^& SCENE HARVESTER
echo ===================================================================================================
echo.
echo  [SYSTEM INITIALIZATION]
echo   - Workspace Path : %~dp0
echo   - Pipeline Mode  : Multi-Tube Verified Stream Ingestion (FPO + Eporner + Wikipedia + Co-Stars)
echo   - Engine Runtime : Node.js StarEngine v5.0
echo.
echo  Verifying environment pre-flight prerequisites...

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  [CRITICAL ERROR] Node.js was not found in your system PATH!
    echo  Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

set "TARGET_FILE="
if exist "%~dp0Dharma jones.txt" set "TARGET_FILE=%~dp0Dharma jones.txt"
if not defined TARGET_FILE if exist "C:\Users\Lenovo\Desktop\Dharma jones.txt" set "TARGET_FILE=C:\Users\Lenovo\Desktop\Dharma jones.txt"
if not defined TARGET_FILE if exist "%USERPROFILE%\Desktop\Dharma jones.txt" set "TARGET_FILE=%USERPROFILE%\Desktop\Dharma jones.txt"
if not defined TARGET_FILE if exist "%USERPROFILE%\OneDrive\Desktop\Dharma jones.txt" set "TARGET_FILE=%USERPROFILE%\OneDrive\Desktop\Dharma jones.txt"

if not defined TARGET_FILE (
    color 0C
    echo.
    echo  [ERROR] Dharma jones.txt was not found!
    echo  Searched:
    echo   1. %~dp0Dharma jones.txt
    echo   2. C:\Users\Lenovo\Desktop\Dharma jones.txt
    echo   3. %USERPROFILE%\Desktop\Dharma jones.txt
    echo.
    echo  Please ensure 'Dharma jones.txt' is on your Desktop or in this folder.
    echo.
    pause
    exit /b 1
)

echo  [OK] Node.js runtime verified.
echo  [OK] Targets File located at: !TARGET_FILE!
echo  [OK] StarEngine pipeline script located.
echo.
echo ===================================================================================================
echo  Starting live ingestion stream monitor...
echo ===================================================================================================
echo.

cd /d "%~dp0"
node starengine.mjs "!TARGET_FILE!"

echo.
echo ===================================================================================================
echo  [EXECUTION COMPLETE] StarEngine pipeline finished. Review log summary above.
echo ===================================================================================================
echo.
pause
