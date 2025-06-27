#!/bin/bash

echo "🧪 Testing PuzzleChat Frontend Routes"
echo "===================================="
echo ""

# Function to check if route returns 200
check_route() {
    local url=$1
    local name=$2
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" = "200" ]; then
        echo "✅ $name: OK ($status)"
    else
        echo "❌ $name: Failed ($status)"
    fi
}

# Test routes
echo "Testing frontend routes..."
check_route "http://localhost:3000/" "Home Page"
check_route "http://localhost:3000/rooms/create" "Create Room Page"
check_route "http://localhost:3000/rooms/TESTCODE" "Room Page (with code)"

echo ""
echo "Testing API integration..."

# Test session creation from frontend
echo "Creating session via API..."
curl -s -X POST http://localhost:5001/api/players/session \
  -H "Content-Type: application/json" \
  -d '{"displayName": "FrontendTest"}' | jq -r '.success'

echo ""
echo "🎮 Frontend URLs:"
echo "- Home: http://localhost:3000"
echo "- Create Room: http://localhost:3000/rooms/create"
echo "- Join Room: Enter code on home page"
echo ""
echo "📡 Backend API: http://localhost:5001"
echo "📊 Health Check: http://localhost:5001/health"