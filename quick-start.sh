#!/bin/bash

# Quick Start Script for IPO ML Prediction System
echo "🚀 Starting IPO ML Prediction System"
echo "=================================="

# Check if we're in the right directory
if [ ! -d "client" ] || [ ! -d "server" ]; then
    echo "❌ Please run this script from the project root directory (IPO-Matchmaker-404-THUGS)"
    exit 1
fi

# Start the client development server
echo "Starting client development server..."
cd client
npm install --silent 2>/dev/null || true
npm run dev &
CLIENT_PID=$!

echo "✅ Client server starting at http://localhost:3000"
echo "📍 Access the ML prediction at: http://localhost:3000/dashboard/predict"
echo ""
echo "How to use:"
echo "1. Navigate to http://localhost:3000/dashboard"
echo "2. Click the 'predict' button in the purple banner at the top"
echo "3. Select an IPO and customize parameters if needed"
echo "4. Click 'Generate Prediction' to see ML-powered results"
echo ""
echo "Press Ctrl+C to stop the servers"

# Wait for interrupt
trap "echo 'Stopping servers...'; kill $CLIENT_PID 2>/dev/null; exit" INT
wait
