@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Starlet Directory - Git Migration & Wallpaper Packaging Tool
color 0B

echo =========================================================================================
echo   STARLET DIRECTORY VIP - CLEAN GIT REPO PACKAGER & WALLPAPER SHIPPER
echo =========================================================================================
echo.
echo Source Folder: %~dp0
echo.

set "DEFAULT_DEST=C:\Users\Lenovo\Desktop\WetDreams"
set /p "TARGET_DEST=Enter target Git folder [Press Enter for default: %DEFAULT_DEST%]: "
if "!TARGET_DEST!"=="" set "TARGET_DEST=%DEFAULT_DEST%"

echo.
echo Target Destination: "!TARGET_DEST!"
echo.
if not exist "!TARGET_DEST!" (
    echo Target folder does not exist. Creating directory...
    mkdir "!TARGET_DEST!"
)

echo.
echo -----------------------------------------------------------------------------------------
echo [STEP 1/3] Copying Core Project Files (Excluding node_modules, dist, scratch, cache)...
echo -----------------------------------------------------------------------------------------
robocopy "%~dp0." "!TARGET_DEST!" /E /XD node_modules dist .git scratch .vscode /XF *.log *.tmp /R:1 /W:1 /NP /NFL /NDL

echo.
echo -----------------------------------------------------------------------------------------
echo [STEP 2/3] Harvesting Used 4K Wallpapers & Analog Airlock Media from Downloads...
echo -----------------------------------------------------------------------------------------

if not exist "!TARGET_DEST!\wallpapers" mkdir "!TARGET_DEST!\wallpapers"

set "DL_DIR=%USERPROFILE%\Downloads"

set WALLPAPERS[0]=ed-and-ein-cowboy-bebop.3840x2160.mp4
set WALLPAPERS[1]=broken-window-the-last-of-us.1920x1080.mp4
set WALLPAPERS[2]=ellie-playing-guitar-in-the-room.1920x1080.mp4
set WALLPAPERS[3]=jake-listens-to-music-alone-at-night-adventure-time-moewalls-com.mp4
set WALLPAPERS[4]=gwen-stacy-street.3840x2160.mp4
set WALLPAPERS[5]=helmet-from-titanfall-2.1920x1080.mp4
set WALLPAPERS[6]=vice-city-dreams.3840x2160.mp4
set WALLPAPERS[7]=mystical-torii.3840x2160.mp4
set WALLPAPERS[8]=the-arcade-the-last-of-us.1920x1080.mp4
set WALLPAPERS[9]=rick-and-morty-riding-car-moewalls-com.mp4
set WALLPAPERS[10]=wallhaven-yqg6r7_2560x1600.png

for /L %%i in (0,1,10) do (
    set "FILE=!WALLPAPERS[%%i]!"
    if exist "!DL_DIR!\!FILE!" (
        echo   [FOUND ^& COPYING] !FILE!
        copy /Y "!DL_DIR!\!FILE!" "!TARGET_DEST!\wallpapers\!FILE!" >nul
    ) else (
        echo   [SKIPPED / NOT IN DOWNLOADS] !FILE!
    )
)

echo.
echo -----------------------------------------------------------------------------------------
echo [STEP 3/3] Git Initialization & Verification
echo -----------------------------------------------------------------------------------------
echo.
echo Project and wallpapers have been copied to:
echo "!TARGET_DEST!"
echo.
echo Next steps in Command Prompt inside "!TARGET_DEST!":
echo   1. cd /d "!TARGET_DEST!"
echo   2. git init
echo   3. git add .
echo   4. git commit -m "Initial commit with full Starlet VIP engine and wallpapers"
echo.
echo To run the web app in the new repo:
echo   1. cd starlet-app ^&^& npm install ^&^& npm run build ^&^& cd ..
echo   2. start.bat
echo.
echo =========================================================================================
echo Packaging complete!
echo =========================================================================================
echo.
pause

