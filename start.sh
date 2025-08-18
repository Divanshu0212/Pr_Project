#!/bin/bash

# Production startup script for Render deployment
set -e

echo "Starting Portfolio Application..."

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-10000}
export ATS_PORT=${ATS_PORT:-8001}
export RESUME_PORT=${RESUME_PORT:-8000}

# Create necessary directories
mkdir -p html_templates output uploads logs

# Check if Python executable exists
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "Using Python command: $PYTHON_CMD"

# Start backend server
echo "Starting Backend Server on port $PORT..."
cd backend && npm start &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 5

# Start ATS service
echo "Starting ATS Analysis Service on port $ATS_PORT..."
cd /app && $PYTHON_CMD ats3.py &
ATS_PID=$!

# Wait a moment for ATS service to initialize
sleep 3

# Start Resume Generator service
echo "Starting Resume Generator Service on port $RESUME_PORT..."
cd /app && $PYTHON_CMD temp4.py &
RESUME_PID=$!

# Function to handle graceful shutdown
cleanup() {
    echo "Shutting down services gracefully..."
    kill $BACKEND_PID $ATS_PID $RESUME_PID 2>/dev/null || true
    sleep 5
    # Force kill if still running
    kill -9 $BACKEND_PID $ATS_PID $RESUME_PID 2>/dev/null || true
    echo "All services stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

echo "All services started successfully!"
echo "Backend PID: $BACKEND_PID"
echo "ATS PID: $ATS_PID" 
echo "Resume Generator PID: $RESUME_PID"
echo "Application should be accessible on port $PORT"

# Keep the script running and wait for all background processes
wait
