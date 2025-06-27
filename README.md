# PuzzleChat - Multiplayer Image Puzzle Game

A real-time multiplayer puzzle game where players collaborate to solve image puzzles while chatting.

## Features

- 🧩 **Image Puzzles**: Upload any image and turn it into a puzzle
- 👥 **Multiplayer**: Up to 8 players per room
- 💬 **Real-time Chat**: Text chat with emoji support
- 😊 **Reactions**: Express yourself with animated reactions
- 🌓 **Dark/Light Mode**: Toggle between themes
- 📱 **Responsive**: Works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Socket.io-client
- **Backend**: Node.js, Express, TypeScript, Socket.io
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary
- **Real-time**: Socket.io for WebSocket communication

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Configure environment variables:
   - Backend: Copy `backend/.env.example` to `backend/.env`
   - Frontend: Copy `frontend/.env.example` to `frontend/.env.local`
   - Add your MongoDB and Cloudinary credentials

4. Start the application:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

## Environment Variables

### Backend (.env)
```
PORT=5001
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_WS_URL=http://localhost:5001
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Deployment

### Backend (Heroku/Railway)

1. Set environment variables
2. Deploy backend folder
3. Ensure MongoDB Atlas whitelist includes deployment IP

### Frontend (Vercel/Netlify)

1. Set environment variables
2. Build command: `npm run build`
3. Output directory: `frontend/.next`

## API Endpoints

- `POST /api/players/session` - Create player session
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:code` - Get room details
- `POST /api/rooms/:code/join` - Join room
- `POST /api/media/upload` - Upload image

## WebSocket Events

- `room:join` - Join a game room
- `game:start` - Start the game
- `game:move` - Make a puzzle move
- `chat:message` - Send chat message
- `reaction:send` - Send reaction

## How to Play

1. **Create a Room**: Click "Create New Room" and upload an image
2. **Share Code**: Share the 6-character room code with friends
3. **Join**: Friends enter the code to join your room
4. **Start**: Host clicks "Start Game" when ready
5. **Play**: Click pieces to swap them and solve the puzzle
6. **Chat**: Use the chat panel to communicate
7. **React**: Send reactions to celebrate or express emotions

## Contributing

Pull requests are welcome! Please read the contributing guidelines first.

## License

MIT