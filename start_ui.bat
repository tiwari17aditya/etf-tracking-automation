@echo off
title Stock & Quant Research Station
echo ========================================================
echo   Stock Market Research, Study & Quant Station (MCP)
echo ========================================================
echo Starting local web server on http://localhost:8000...
echo.

.\.venv\Scripts\python.exe core/ui_server.py
pause
