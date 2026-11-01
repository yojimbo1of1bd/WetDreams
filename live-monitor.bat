@echo off
title ★ Starlet Directory — StarEngine Realtime Live Monitor ★
color 0A
mode con: cols=115 lines=38
echo ===========================================================================================
echo            ★ STARENGINE LIVE FOREGROUND MONITOR — REALTIME PROGRESS STREAM ★
echo ===========================================================================================
echo Target: C:\Users\Lenovo\Desktop\Dharma jones.txt
echo Streaming live output from StarEngine pipeline...
echo ===========================================================================================
echo.
powershell -NoExit -Command "$Host.UI.RawUI.WindowTitle = '★ StarEngine Realtime Ingestion Monitor ★'; Get-Content -Path 'C:\Users\Lenovo\.gemini\antigravity\brain\5e7a3a00-adfa-466b-8929-bf9ee1411737\.system_generated\tasks\task-1583.log' -Wait -Tail 40"

