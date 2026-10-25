#!/usr/bin/env bash
# ==============================================================================
# WhatsSchedule — 1-Click Launcher (Mac & Linux)
# Created by Aroon Kumar
# ==============================================================================

echo "=================================================="
echo "⏰ Starting WhatsSchedule..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Error: Node.js is not installed."
    echo "👉 Please install Node.js (v18+) from https://nodejs.org"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "📦 First-time setup: Installing required packages (takes ~30s)..."
    npm run install:all
    cd server && npx prisma db push && cd ..
fi

# Build if dist does not exist
if [ ! -d "server/dist" ] || [ ! -d "client/dist" ]; then
    echo "🔨 Building high-speed production assets..."
    npm run build
fi

echo "🚀 Launching WhatsSchedule daemon on http://localhost:5001"
echo "🌐 Opening your browser..."

# Open browser based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:5001"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:5001" >/dev/null 2>&1 &
fi

# Run server
npm start
