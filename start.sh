#!/bin/bash

# Kill any existing node processes for this project
pkill -f "node server.js" 2>/dev/null
sleep 1

echo "🇰🇭 Starting Khmer Spelling Assistant..."

# Navigate to backend and start
cd "$(dirname "$0")/backend"
npm start
