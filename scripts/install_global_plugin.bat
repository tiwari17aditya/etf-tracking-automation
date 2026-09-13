@echo off
setlocal

echo ======================================================================
echo Antigravity Global Plugin Installer - Smart Dip & HITL Quant Suite
echo ======================================================================

set "TARGET_DIR=%USERPROFILE%\.gemini\config\plugins\smart-dip-suite"
set "SOURCE_DIR=%~dp0..\.agents"

echo Source Customizations: %SOURCE_DIR%
echo Target Global Root:   %TARGET_DIR%
echo.

if not exist "%USERPROFILE%\.gemini\config\plugins" (
    mkdir "%USERPROFILE%\.gemini\config\plugins" 2>nul
)

if not exist "%TARGET_DIR%" (
    mkdir "%TARGET_DIR%" 2>nul
)

echo Copying plugin definition, skills, and rules to global Antigravity config...
xcopy /E /I /Y "%SOURCE_DIR%\skills" "%TARGET_DIR%\skills" >nul
xcopy /E /I /Y "%SOURCE_DIR%\rules" "%TARGET_DIR%\rules" >nul
copy /Y "%SOURCE_DIR%\plugins\smart-dip-suite\plugin.json" "%TARGET_DIR%\plugin.json" >nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Global plugin 'smart-dip-suite' installed successfully!
    echo All new and existing Antigravity projects will now automatically
    echo have access to:
    echo   - smart-dip-quant (RSI-14, 50-EMA quantitative calculations)
    echo   - smart-dip-hitl-workflow (Human-in-the-loop safeguards)
    echo   - vercel-serverless-deploy (Vercel cron & deployment)
    echo   - smart-dip-orchestrator (Cross-skill coordinator)
    echo   - /packup (Automated git push, doc updates, & motivational quote)
    echo ======================================================================
) else (
    echo [ERROR] Installation failed. Please ensure Antigravity IDE has write permissions.
)

pause
