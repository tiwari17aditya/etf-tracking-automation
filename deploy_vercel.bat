@echo off
title Deploy Stock Research Station to Vercel
color 0b
echo =======================================================================
echo     Stock Research & Quant Station - 1-Click Vercel Deployment
echo =======================================================================
echo.
echo [Step 1/2] Authenticating with Vercel...
echo (Your browser will open to authenticate securely without credential exposure)
echo.
cmd.exe /c "npx -y vercel login"
if errorlevel 1 (
    echo [!] Vercel login failed or was cancelled.
    pause
    exit /b %errorlevel%
)

echo.
echo [Step 2/2] Deploying project to Vercel Production...
echo.
cmd.exe /c "npx -y vercel --prod"

echo.
echo =======================================================================
echo  Deployment complete! Check your live Vercel URL above.
echo =======================================================================
pause
