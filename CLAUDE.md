# PuzzleChat Project Context

This file helps Claude Code understand the PuzzleChat multiplayer puzzle game project.

## Project Overview
**Project Name:** PuzzleChat
**Purpose:** Real-time multiplayer image puzzle game with integrated chat, voice, and video communication
**Status:** Architecture Planning Complete, Ready for Implementation

## Architecture & Structure
```
/
├── frontend/         # Next.js 14 app
├── backend/          # Node.js Express API
├── shared/           # Shared types and utilities
├── docs/             # Documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── SYSTEM_DESIGN.md
│   └── TODO_PLAN.md
└── infrastructure/   # Docker, deployment configs
```

## Key Components
1. **Game Engine**: Image puzzle generation and state management
2. **Real-time System**: Socket.io for multiplayer synchronization
3. **Communication Layer**: Text chat, WebRTC for voice/video
4. **Room Management**: Create/join rooms with unique codes
5. **Reaction System**: ROAM-style quick reactions and interactions

## Development Guidelines
1. **Code Style**: Use TypeScript with strict mode
2. **Frontend**: Follow Next.js App Router patterns
3. **Backend**: RESTful APIs + WebSocket events
4. **Testing**: Integration tests for game flows
5. **Performance**: Optimize for <100ms latency
6. **Write tests for each changes**

## Important Commands
```bash
# Frontend (Next.js)
cd frontend
npm install
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run ESLint
npm run type-check # TypeScript check

# Backend (Node.js)
cd backend
npm install
npm run dev        # Start with nodemon
npm run build      # Compile TypeScript
npm run start      # Production server
npm run test       # Run tests

# Full stack
npm run dev:all    # Start both frontend and backend
```

## Tech Stack
- [x] Frontend: Next.js 14 + TypeScript
- [x] State Management: Zustand + React Query
- [x] Backend: Node.js + Express + TypeScript
- [x] Database: PostgreSQL
- [x] Cache: Redis
- [x] Real-time: Socket.io
- [x] Video/Audio: WebRTC
- [x] Styling: Tailwind CSS
- [x] Media Storage: S3/Cloudinary

## Current Implementation Status
- [x] Architecture planning complete
- [x] System design documented
- [ ] Project setup and configuration
- [ ] Basic game mechanics
- [ ] Real-time multiplayer
- [ ] Communication features
- [ ] UI/UX implementation

## API Endpoints
- POST /api/rooms - Create game room
- GET /api/rooms/:code - Get room details
- POST /api/rooms/:code/join - Join room
- POST /api/media/upload - Upload puzzle image

## WebSocket Events
- room:join - Join a room
- game:move - Make a puzzle move
- chat:message - Send chat message
- reaction:send - Send reaction

## Known Constraints
- Max 8 players per room
- Image uploads limited to 10MB
- Puzzle sizes: 3x3 to 6x6 grid
- Room codes are 6 characters

## Performance Targets
- Page load: <3 seconds
- Move latency: <100ms
- 100 concurrent rooms
- 99% uptime

## Current Tasks
- Initial project setup
- Define project requirements
- Choose tech stack
- Implement core game mechanics

## Known Issues & Limitations
- WebRTC requires HTTPS in production
- Redis required for multi-server scaling
- Image processing can be CPU intensive

## Additional Context
This is a hackathon project focusing on real-time collaboration and social gaming. The architecture emphasizes low latency and smooth user experience.