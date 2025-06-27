#!/bin/bash

echo "🧪 Testing PuzzleChat API Routes"
echo "================================"
echo ""

API_URL="http://localhost:5001"

# Test health endpoint
echo "1. Testing Health Endpoint..."
curl -s "$API_URL/health" | jq '.'
echo ""

# Create session
echo "2. Creating Player Session..."
SESSION_RESPONSE=$(curl -s -X POST "$API_URL/api/players/session" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "TestPlayer"}')
echo "$SESSION_RESPONSE" | jq '.'

# Extract sessionId and playerId
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.data.sessionId')
PLAYER_ID=$(echo "$SESSION_RESPONSE" | jq -r '.data.playerId')
echo ""

# Get player info
echo "3. Getting Player Info..."
curl -s "$API_URL/api/players/$SESSION_ID" | jq '.'
echo ""

# Test image upload (mock)
echo "4. Testing Image Upload Endpoint..."
echo "Note: Actual file upload requires a real image file"
echo ""

# Create a room (without image for testing)
echo "5. Creating Room..."
ROOM_RESPONSE=$(curl -s -X POST "$API_URL/api/rooms" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Room\",
    \"description\": \"This is a test room\",
    \"difficulty\": \"medium\",
    \"hostId\": \"$PLAYER_ID\",
    \"imageUrl\": \"https://res.cloudinary.com/demo/image/upload/sample.jpg\"
  }")
echo "$ROOM_RESPONSE" | jq '.'

# Extract room code
ROOM_CODE=$(echo "$ROOM_RESPONSE" | jq -r '.data.code')
echo ""

# Get room info
echo "6. Getting Room Info..."
curl -s "$API_URL/api/rooms/$ROOM_CODE" | jq '.'
echo ""

# Join room
echo "7. Joining Room..."
curl -s -X POST "$API_URL/api/rooms/$ROOM_CODE/join" \
  -H "Content-Type: application/json" \
  -d "{\"playerId\": \"$PLAYER_ID\"}" | jq '.'
echo ""

echo "✅ All routes tested!"
echo ""
echo "Summary:"
echo "- Session ID: $SESSION_ID"
echo "- Player ID: $PLAYER_ID"
echo "- Room Code: $ROOM_CODE"
echo ""
echo "You can now visit:"
echo "- Frontend: http://localhost:3001"
echo "- Room URL: http://localhost:3001/rooms/$ROOM_CODE"