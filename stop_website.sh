#!/bin/bash

echo "Stopping servers on ports 8000 and 8001..."

# Find and kill processes on port 8000 (Backend)
PID_8000=$(lsof -ti:8000)
if [ ! -z "$PID_8000" ]; then
    echo "Killing backend server process (PID: $PID_8000)..."
    kill -9 $PID_8000
else
    echo "No backend server found running on port 8000."
fi

# Find and kill processes on port 8001 (Frontend)
PID_8001=$(lsof -ti:8001)
if [ ! -z "$PID_8001" ]; then
    echo "Killing frontend server process (PID: $PID_8001)..."
    kill -9 $PID_8001
else
    echo "No frontend server found running on port 8001."
fi

echo "Website servers stopped."
