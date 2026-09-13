@echo off
setlocal

echo =======================================================
echo Smart Dip Accumulator - Automated GitHub Push Utility
echo =======================================================

git status

set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/user/repo.git) or press Enter if already set: "

if not "%REPO_URL%"=="" (
    git remote remove origin 2>nul
    git remote add origin %REPO_URL%
    echo Remote origin set to %REPO_URL%
)

echo.
echo Staging and committing any pending files...
git add .
git commit -m "feat: Automated Vercel zero-touch deployment and GitHub workflows" 2>nul

echo.
echo Renaming branch to main and pushing...
git branch -M main
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =======================================================
    echo Successfully pushed to GitHub!
    echo =======================================================
) else (
    echo.
    echo [ERROR] Push failed. Please check your GitHub repository permissions or credentials.
)

pause
