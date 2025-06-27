#!/bin/bash

echo "🚀 Starting PuzzleChat Application"
echo "================================"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Kill any existing processes
echo "🔧 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
pkill -f "ts-node" 2>/dev/null
sleep 2

# Start backend
echo ""
echo "📡 Starting Backend Server..."
cd backend
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file from .env.example..."
    cp .env.example .env
fi

npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
if check_port 5001; then
    echo "✅ Backend is running on http://localhost:5001"
else
    echo "❌ Backend failed to start. Check backend/backend.log for errors"
    exit 1
fi

# Start frontend
echo ""
echo "🎨 Starting Frontend Server..."
cd ../frontend
if [ ! -f .env.local ]; then
    echo "⚠️  Creating .env.local file from .env.example..."
    cp .env.example .env.local
fi

# Clean Next.js cache
rm -rf .next

npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "Waiting for frontend to start..."
sleep 8

# Check if frontend is running
if check_port 3000 || check_port 3001; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start. Check frontend/frontend.log for errors"
    exit 1
fi

echo ""
echo "✅ PuzzleChat is now running!"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5001"
echo "   Health Check: http://localhost:5001/health"
echo ""
echo "📝 Logs:"
echo "   Backend: backend/backend.log"
echo "   Frontend: frontend/frontend.log"
echo ""
echo "🛑 To stop the application:"
echo "   Press Ctrl+C or run: pkill -f 'next dev' && pkill -f 'nodemon'"
echo ""
echo "🎮 How to play:"
echo "   1. Create a new room"
echo "   2. Upload an image for the puzzle"
echo "   3. Share the room code with friends"
echo "   4. Start the game when everyone joins"
echo "   5. Solve the puzzle together!"
echo ""

# Keep script running
wait $BACKEND_PID $FRONTEND_PID