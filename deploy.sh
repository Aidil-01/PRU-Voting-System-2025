#!/bin/bash

# 🚀 PRU Voting System - Auto Deploy Script
# Pastikan anda sudah setup Github, Railway, dan Vercel accounts

echo "🇲🇾 PRU Voting System - Auto Deploy Script"
echo "==========================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "⚠️  Git not initialized. Initializing..."
    git init
    git branch -M main
fi

# Add all files and commit
echo "📦 Adding files and committing..."
git add .
git commit -m "Deploy: PRU Voting System $(date '+%Y-%m-%d %H:%M:%S')"

# Push to Github (user needs to add remote origin manually)
echo "🔄 Pushing to Github..."
if git remote get-url origin > /dev/null 2>&1; then
    git push -u origin main
    echo "✅ Code pushed to Github successfully!"
else
    echo "❌ Github remote not set. Please run:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/PRU-Voting-System-2025.git"
    echo "   Then run this script again."
    exit 1
fi

echo ""
echo "🎯 Next Steps:"
echo "1. ✅ Code is now on Github"
echo "2. 🗄️  Setup Railway database: https://railway.app"
echo "3. 🖥️  Deploy backend to Railway (connect GitHub repo)"
echo "4. 🌐 Deploy frontend to Vercel (connect GitHub repo)"
echo "5. 🔗 Update environment variables to connect services"
echo ""
echo "📖 For detailed instructions, read: SETUP-GUIDE-DETAILED.md"
echo "⚡ For quick reference, read: PANDUAN-CEPAT.md"
echo ""
echo "🎉 Happy deploying!"