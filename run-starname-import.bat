@echo off
title Starlet Directory — Starname Ingestion Pipeline & ASCII Monitor
echo ======================================================================
echo    Starting Starname Ingestion Pipeline (Age Filter: ^<= 40)
echo ======================================================================
echo.
node import-starname-pipeline.mjs --limit 50
echo.
echo Press any key to run another batch, or close this window.
pause
"%~f0"

