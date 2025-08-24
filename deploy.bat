@echo off
REM 🚀 PRU Voting System - Auto Deploy Script (Windows)
REM Pastikan anda sudah setup Github, Railway, dan Vercel accounts

echo 🇲🇾 PRU Voting System - Auto Deploy Script
echo ===========================================

REM Check if git is initialized
if not exist ".git" (
    echo ⚠️  Git not initialized. Initializing...
    git init
    git branch -M main
)

REM Add all files and commit
echo 📦 Adding files and committing...
git add .
git commit -m "Deploy: PRU Voting System %date% %time%"

REM Push to Github (user needs to add remote origin manually)
echo 🔄 Pushing to Github...
git remote get-url origin >nul 2>&1
if %errorlevel% == 0 (
    git push -u origin main
    echo ✅ Code pushed to Github successfully!
) else (
    echo ❌ Github remote not set. Please run:
    echo    git remote add origin https://github.com/YOUR_USERNAME/PRU-Voting-System-2025.git
    echo    Then run this script again.
    pause
    exit /b 1
)

echo.
echo 🎯 Next Steps:
echo 1. ✅ Code is now on Github
echo 2. 🗄️  Setup Railway database: https://railway.app
echo 3. 🖥️  Deploy backend to Railway (connect GitHub repo)
echo 4. 🌐 Deploy frontend to Vercel (connect GitHub repo)
echo 5. 🔗 Update environment variables to connect services
echo.
echo 📖 For detailed instructions, read: SETUP-GUIDE-DETAILED.md
echo ⚡ For quick reference, read: PANDUAN-CEPAT.md
echo.
echo 🎉 Happy deploying!
pause