@echo off
REM SmartWaste Deployment Script for Windows
REM This script builds and deploys all three role-based dashboards

echo 🚀 SmartWaste Deployment Started
echo =================================

REM Change to frontend directory
cd frontend

echo 📦 Installing dependencies...
npm install

echo 🏗️  Building User Dashboard...
npm run build:user
echo ✅ User dashboard build complete

echo 🏗️  Building Cleaner Dashboard...
npm run build:cleaner
echo ✅ Cleaner dashboard build complete

echo 🏗️  Building Admin Dashboard...
npm run build:admin
echo ✅ Admin dashboard build complete

echo.
echo 🎯 Build Summary:
echo - User Dashboard: Built for citizens to report waste
echo - Cleaner Dashboard: Built for waste management workers
echo - Admin Dashboard: Built for system administrators

echo.
echo 📋 Next Steps:
echo 1. Deploy User Dashboard to: https://report.smartwaste.com
echo 2. Deploy Cleaner Dashboard to: https://clean.smartwaste.com
echo 3. Deploy Admin Dashboard to: https://admin.smartwaste.com
echo 4. Deploy Backend API to: https://api.smartwaste.com

echo.
echo 🔧 Deployment Options:
echo - Firebase Hosting: Use firebase-*.json configs
echo - Netlify: Use netlify-*.toml configs
echo - Docker: Use docker-compose.yml
echo - Vercel: Set environment variables per deployment

echo.
echo ✨ Deployment script completed successfully!
pause