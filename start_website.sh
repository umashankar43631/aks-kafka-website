#!/bin/bash

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C (SIGINT) and kill signals
trap cleanup SIGINT SIGTERM

echo "Starting Backend on port 8000..."
cd backend
if [ -d "../venv" ]; then
    source ../venv/bin/activate
fi
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

echo "Starting Frontend on port 8001..."
cd frontend
python3 -m http.server 8001 &
FRONTEND_PID=$!
cd ..

echo "======================================"
echo "Servers are running!"
echo "Backend API: http://127.0.0.1:8000"
echo "Frontend:    http://127.0.0.1:8001"
echo "Press Ctrl+C to stop both servers."
echo "======================================"

# Wait for both background processes to keep the script running
wait $BACKEND_PID $FRONTEND_PID
