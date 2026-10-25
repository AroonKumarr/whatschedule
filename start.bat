@echo off
TITLE WhatsSchedule Launcher - Aroon Kumar
echo ==================================================
echo   Starting WhatsSchedule...
echo ==================================================

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    echo Please download and install Node.js from https://nodejs.org
    pause
    exit /b
)

if not exist "node_modules\" (
    echo First-time setup: Installing dependencies...
    call npm run install:all
    cd server
    call npx prisma db push
    cd ..
)

if not exist "client\dist\" (
    echo Building application assets...
    call npm run build
)

echo Opening browser at http://localhost:5001 ...
start http://localhost:5001

call npm start
pause
