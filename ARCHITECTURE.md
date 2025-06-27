# PuzzleChat - System Architecture

## 1. High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  React SPA   │   WebRTC    │  Socket.io Client  │  Service Worker│
└────────┬─────────────┬──────────────┬────────────────┬──────────┘
         │             │              │                │
         │         ┌───┴──────────────┴────────────────┴───┐
         │         │          Load Balancer (Nginx)         │
         │         └───┬──────────────┬────────────────┬───┘
         │             │              │                │
┌────────▼─────────────▼──────────────▼────────────────▼──────────┐
│                          API Gateway                              │
├───────────────────────────────────────────────────────────────────┤
│     REST API     │   WebSocket Server  │   WebRTC Signaling      │
├───────────────────────────────────────────────────────────────────┤
│                      Application Services                          │
├─────────────────┬─────────────────┬──────────────────────────────┤
│  Game Service   │  Room Service   │   Communication Service       │
│  Auth Service   │  Media Service  │   Notification Service        │
└─────────────────┴────────┬────────┴──────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                        Data Layer                                 │
├─────────────────┬─────────────────┬──────────────────────────────┤
│   PostgreSQL    │     Redis        │        S3/Cloudinary        │
│   (Persistent)  │   (Cache/Pub-Sub)│      (Media Storage)        │
└─────────────────┴─────────────────┴──────────────────────────────┘
```

## 2. Component Architecture

### 2.1 Frontend Architecture (Next.js)

```
frontend/
├── app/                          # Next.js 13+ App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── error.tsx                # Error boundary
│   ├── loading.tsx              # Loading state
│   ├── rooms/
│   │   ├── create/
│   │   │   └── page.tsx        # Create room page
│   │   └── [code]/
│   │       ├── page.tsx        # Game room page
│   │       ├── layout.tsx      # Room layout
│   │       └── loading.tsx     # Room loading
│   └── api/                     # API routes (if needed)
│       └── revalidate/
│           └── route.ts
├── components/
│   ├── game/
│   │   ├── PuzzleBoard.tsx
│   │   ├── PuzzlePiece.tsx
│   │   ├── DragLayer.tsx
│   │   └── ProgressIndicator.tsx
│   ├── communication/
│   │   ├── ChatPanel.tsx
│   │   ├── VideoGrid.tsx
│   │   ├── VoiceControls.tsx
│   │   └── ReactionButtons.tsx
│   ├── room/
│   │   ├── CreateRoomForm.tsx
│   │   ├── JoinRoomForm.tsx
│   │   ├── RoomLobby.tsx
│   │   └── PlayerList.tsx
│   └── ui/                      # Shared UI components
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── Card.tsx
├── hooks/
│   ├── useSocket.ts
│   ├── useWebRTC.ts
│   ├── useGame.ts
│   └── useDragAndDrop.ts
├── lib/                         # Utilities and services
│   ├── api.ts
│   ├── socket.ts
│   ├── webrtc.ts
│   └── utils.ts
├── providers/                   # Context providers
│   ├── SocketProvider.tsx
│   ├── GameProvider.tsx
│   └── ThemeProvider.tsx
├── types/
│   ├── game.types.ts
│   ├── room.types.ts
│   └── user.types.ts
├── public/                      # Static assets
│   ├── images/
│   └── sounds/
└── styles/
    ├── globals.css
    └── variables.css
```

### 2.2 Backend Architecture

```
backend/
├── src/
│   ├── controllers/
│   │   ├── roomController.ts
│   │   ├── gameController.ts
│   │   ├── mediaController.ts
│   │   └── userController.ts
│   ├── services/
│   │   ├── roomService.ts
│   │   ├── gameService.ts
│   │   ├── puzzleService.ts
│   │   ├── mediaService.ts
│   │   └── sessionService.ts
│   ├── sockets/
│   │   ├── gameHandlers.ts
│   │   ├── chatHandlers.ts
│   │   ├── reactionHandlers.ts
│   │   └── webrtcHandlers.ts
│   ├── models/
│   │   ├── Room.ts
│   │   ├── Player.ts
│   │   ├── GameState.ts
│   │   └── Message.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── utils/
│   │   ├── puzzle.ts
│   │   ├── imageProcessor.ts
│   │   └── logger.ts
│   └── config/
│       ├── database.ts
│       ├── redis.ts
│       └── storage.ts
```

## 3. Data Models

### 3.1 Database Schema (PostgreSQL)

```sql
-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(6) UNIQUE NOT NULL,
    host_id UUID REFERENCES players(id),
    name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'waiting',
    max_players INTEGER DEFAULT 8,
    difficulty VARCHAR(10) DEFAULT '4x4',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Game states table
CREATE TABLE game_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    original_image_url VARCHAR(255) NOT NULL,
    scrambled_data JSONB NOT NULL,
    solution_data JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player progress table
CREATE TABLE player_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    progress_data JSONB NOT NULL,
    completion_percentage INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    UNIQUE(room_id, player_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reactions table
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL,
    target_player_id UUID REFERENCES players(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Redis Data Structures

```typescript
// Active rooms
rooms:active = Set<roomCode>

// Room details (Hash)
room:{roomCode} = {
  hostId: string,
  players: string[], // player IDs
  status: 'waiting' | 'playing' | 'completed',
  gameStateId: string
}

// Player sessions (Hash)
session:{sessionId} = {
  playerId: string,
  roomCode: string,
  lastActive: timestamp
}

// Real-time game state (Hash)
game:{roomCode} = {
  puzzle: JSON, // current puzzle state
  playerProgress: JSON, // progress for each player
  startTime: timestamp
}

// Socket connections (Hash)
sockets:players = {
  playerId: socketId
}
```

## 4. API Design

### 4.1 REST API Endpoints

```typescript
// Room Management
POST   /api/rooms                    // Create new room
GET    /api/rooms/:code              // Get room details
POST   /api/rooms/:code/join         // Join room
POST   /api/rooms/:code/start        // Start game
DELETE /api/rooms/:code              // Delete room

// Game Management
POST   /api/games/:roomCode/move     // Submit piece move
GET    /api/games/:roomCode/state    // Get current game state
POST   /api/games/:roomCode/complete // Mark game as complete

// Media Management
POST   /api/media/upload             // Upload puzzle image
GET    /api/media/:id                // Get media file

// Player Management
POST   /api/players/session          // Create guest session
PUT    /api/players/:id              // Update player info
```

### 4.2 WebSocket Events

```typescript
// Client → Server Events
interface ClientEvents {
  'room:join': { roomCode: string; playerId: string };
  'room:leave': { roomCode: string; playerId: string };
  'game:move': { pieceId: string; position: Position };
  'chat:message': { content: string; roomCode: string };
  'reaction:send': { type: ReactionType; targetId?: string };
  'webrtc:signal': { signal: any; targetId: string };
}

// Server → Client Events
interface ServerEvents {
  'room:updated': { room: Room };
  'player:joined': { player: Player };
  'player:left': { playerId: string };
  'game:started': { gameState: GameState };
  'game:updated': { playerId: string; progress: Progress };
  'game:completed': { winnerId: string; stats: GameStats };
  'chat:message': { message: Message };
  'reaction:received': { reaction: Reaction };
  'webrtc:signal': { signal: any; fromId: string };
}
```

## 5. Core Algorithms

### 5.1 Puzzle Generation Algorithm

```typescript
interface PuzzleGenerator {
  generatePuzzle(image: Buffer, difficulty: Difficulty): {
    pieces: PuzzlePiece[];
    solution: Solution;
  };
  
  scramblePieces(pieces: PuzzlePiece[]): PuzzlePiece[];
  
  validateSolution(
    currentState: PuzzlePiece[], 
    solution: Solution
  ): boolean;
}

// Grid-based puzzle generation
class GridPuzzleGenerator implements PuzzleGenerator {
  generatePuzzle(image: Buffer, difficulty: Difficulty) {
    const { rows, cols } = this.getDimensions(difficulty);
    const pieces = this.sliceImage(image, rows, cols);
    const solution = this.createSolution(pieces);
    const scrambled = this.scramblePieces(pieces);
    
    return { pieces: scrambled, solution };
  }
  
  private sliceImage(image: Buffer, rows: number, cols: number) {
    // Use Sharp to slice image into grid pieces
    // Each piece gets unique ID and correct position
  }
  
  private scramblePieces(pieces: PuzzlePiece[]) {
    // Fisher-Yates shuffle ensuring solvability
    // Avoid creating unsolvable permutations
  }
}
```

### 5.2 Real-time Synchronization

```typescript
class GameSynchronizer {
  private gameStates: Map<string, GameState>;
  private redis: Redis;
  
  async syncMove(roomCode: string, move: Move): Promise<void> {
    // 1. Validate move
    const isValid = await this.validateMove(roomCode, move);
    if (!isValid) throw new InvalidMoveError();
    
    // 2. Update local state
    const gameState = this.gameStates.get(roomCode);
    gameState.applyMove(move);
    
    // 3. Persist to Redis
    await this.redis.hset(
      `game:${roomCode}`,
      'state',
      JSON.stringify(gameState)
    );
    
    // 4. Broadcast to room
    this.io.to(roomCode).emit('game:updated', {
      playerId: move.playerId,
      progress: gameState.getPlayerProgress(move.playerId)
    });
    
    // 5. Check win condition
    if (gameState.isComplete(move.playerId)) {
      await this.handleGameComplete(roomCode, move.playerId);
    }
  }
}
```

## 6. Security Architecture

### 6.1 Authentication Flow

```typescript
// Session-based authentication for guests
class SessionManager {
  async createGuestSession(req: Request): Promise<Session> {
    const sessionId = generateSecureToken();
    const playerId = generateUUID();
    
    // Store in database
    await db.players.create({
      id: playerId,
      sessionId,
      displayName: generateGuestName()
    });
    
    // Cache in Redis
    await redis.hset(`session:${sessionId}`, {
      playerId,
      createdAt: Date.now()
    });
    
    return { sessionId, playerId };
  }
}
```

### 6.2 Input Validation

```typescript
// Validation middleware
const validators = {
  roomCode: Joi.string().length(6).uppercase(),
  imageUpload: {
    fileSize: 10 * 1024 * 1024, // 10MB
    mimeTypes: ['image/jpeg', 'image/png'],
    dimensions: { maxWidth: 4096, maxHeight: 4096 }
  },
  chatMessage: Joi.string().max(500).trim()
};
```

## 7. Performance Optimizations

### 7.1 Image Processing Pipeline

```typescript
class ImageProcessor {
  async processUpload(file: Express.Multer.File): Promise<string> {
    // 1. Validate file
    await this.validateImage(file);
    
    // 2. Optimize image
    const optimized = await sharp(file.buffer)
      .resize(1024, 1024, { fit: 'inside' })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    // 3. Generate thumbnail
    const thumbnail = await sharp(file.buffer)
      .resize(200, 200)
      .toBuffer();
    
    // 4. Upload to S3/Cloudinary
    const urls = await Promise.all([
      this.storage.upload(optimized, 'full'),
      this.storage.upload(thumbnail, 'thumb')
    ]);
    
    return urls[0];
  }
}
```

### 7.2 Caching Strategy

```typescript
// Multi-level caching
class CacheManager {
  private memoryCache: LRUCache;
  private redisCache: Redis;
  
  async get(key: string): Promise<any> {
    // L1: Memory cache
    const memResult = this.memoryCache.get(key);
    if (memResult) return memResult;
    
    // L2: Redis cache
    const redisResult = await this.redisCache.get(key);
    if (redisResult) {
      this.memoryCache.set(key, redisResult);
      return redisResult;
    }
    
    return null;
  }
}
```

## 8. Deployment Architecture

### 8.1 Container Structure

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://api:4000
      - REACT_APP_WS_URL=ws://api:4000
  
  api:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/puzzlechat
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=puzzlechat
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 8.2 Scaling Strategy

```nginx
# nginx.conf for load balancing
upstream backend {
    least_conn;
    server backend1:4000;
    server backend2:4000;
    server backend3:4000;
}

server {
    listen 80;
    
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
    }
    
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 9. Monitoring & Observability

### 9.1 Logging Structure

```typescript
// Structured logging
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'combined.log' 
    })
  ]
});

// Usage
logger.info('game:completed', {
  roomCode: room.code,
  winnerId: winner.id,
  duration: Date.now() - startTime,
  players: room.players.length
});
```

### 9.2 Metrics Collection

```typescript
// Key metrics to track
interface GameMetrics {
  activeRooms: number;
  activePlayers: number;
  gamesCompleted: number;
  averageGameDuration: number;
  puzzleSolveRate: number;
  chatMessagesPerMinute: number;
  reactionsPerGame: number;
}
```

## 10. Error Handling Strategy

```typescript
// Global error handler
class ErrorHandler {
  handle(error: Error, context: ErrorContext): void {
    // Log error
    logger.error(error.message, {
      stack: error.stack,
      context
    });
    
    // Notify monitoring service
    if (this.isCritical(error)) {
      this.notificationService.alert(error);
    }
    
    // Return user-friendly message
    return this.getUserMessage(error);
  }
}
```