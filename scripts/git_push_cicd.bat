@echo off
title Push Changes to Git for CI/CD Deployment
color 0a

echo =======================================================================
echo          Push Changes to Git for Automatic CI/CD Deployment
echo =======================================================================
echo.

set COMMIT_MSG=%*
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Auto-deploy: sync project enhancements and quant UI features

echo [1/3] Staging all changes...
git add -A

echo [2/3] Committing changes...
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo [i] Nothing new to commit or working tree clean.
)

echo.
echo [3/3] Pushing to remote main branch...
git push origin main
if errorlevel 1 (
    echo.
    echo [!] Git push failed. Please check network connection or remote credentials.
    pause
    exit /b %errorlevel%
)

echo.
echo =======================================================================
echo  SUCCESS: Pushed to GitHub! 
echo  Vercel CI/CD and GitHub Actions deployment pipelines triggered.
echo =======================================================================
echo.
