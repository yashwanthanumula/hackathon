# Next.js Frontend Architecture for PuzzleChat

## 1. Next.js App Structure

```
puzzlechat-frontend/
├── app/                              # App Router (Next.js 13+)
│   ├── (marketing)/                 # Marketing pages group
│   │   ├── layout.tsx              
│   │   ├── page.tsx                # Landing page
│   │   └── about/
│   │       └── page.tsx
│   ├── (game)/                      # Game pages group
│   │   ├── layout.tsx              # Game layout with providers
│   │   ├── rooms/
│   │   │   ├── create/
│   │   │   │   └── page.tsx        # Create room (SSR)
│   │   │   └── [code]/
│   │   │       ├── page.tsx        # Game room (dynamic)
│   │   │       ├── loading.tsx     
│   │   │       └── error.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── api/                         # API Routes
│   │   ├── auth/
│   │   │   └── session/
│   │   │       └── route.ts
│   │   ├── rooms/
│   │   │   └── validate/
│   │   │       └── route.ts
│   │   └── revalidate/
│   │       └── route.ts
│   ├── layout.tsx                   # Root layout
│   ├── error.tsx                    # Global error boundary
│   └── not-found.tsx               # 404 page
├── components/
│   ├── game/                        # Game components
│   │   ├── PuzzleBoard/
│   │   │   ├── index.tsx
│   │   │   ├── PuzzleBoard.module.css
│   │   │   └── usePuzzleBoard.ts
│   │   ├── PuzzlePiece/
│   │   ├── GameControls/
│   │   └── WinnerModal/
│   ├── communication/               # Chat/Video components
│   │   ├── ChatPanel/
│   │   ├── VideoGrid/
│   │   ├── ReactionBar/
│   │   └── VoiceIndicator/
│   ├── room/                        # Room management
│   │   ├── CreateRoomForm/
│   │   ├── RoomCode/
│   │   └── PlayerList/
│   └── ui/                          # Shared UI components
│       ├── Button/
│       ├── Card/
│       ├── Modal/
│       └── LoadingSpinner/
├── hooks/                           # Custom hooks
│   ├── useSocket.ts
│   ├── useWebRTC.ts
│   ├── useGame.ts
│   ├── useOptimistic.ts
│   └── useMediaQuery.ts
├── lib/                             # Core utilities
│   ├── api/
│   │   ├── client.ts               # API client setup
│   │   ├── rooms.ts                # Room API calls
│   │   └── media.ts                # Media upload
│   ├── socket/
│   │   ├── client.ts               # Socket.io client
│   │   └── events.ts               # Event definitions
│   ├── webrtc/
│   │   ├── peer.ts                 # WebRTC peer management
│   │   └── signaling.ts            # Signaling logic
│   └── utils/
│       ├── puzzle.ts               # Puzzle utilities
│       ├── image.ts                # Image processing
│       └── constants.ts            # App constants
├── providers/                       # Context providers
│   ├── SocketProvider.tsx
│   ├── GameProvider.tsx
│   ├── WebRTCProvider.tsx
│   └── ThemeProvider.tsx
├── store/                           # Zustand stores
│   ├── gameStore.ts
│   ├── roomStore.ts
│   └── userStore.ts
├── types/                           # TypeScript types
│   ├── game.ts
│   ├── room.ts
│   ├── socket.ts
│   └── api.ts
├── public/                          # Static assets
│   ├── images/
│   ├── sounds/
│   └── fonts/
├── styles/                          # Global styles
│   ├── globals.css
│   ├── variables.css
│   └── animations.css
├── middleware.ts                    # Next.js middleware
├── next.config.js                   # Next.js config
├── tailwind.config.ts              # Tailwind config
└── tsconfig.json                   # TypeScript config
```

## 2. Key Next.js Features Implementation

### 2.1 Server Components Strategy

```typescript
// app/(game)/rooms/[code]/page.tsx
// Server Component for initial data fetching
export default async function GameRoomPage({ 
  params 
}: { 
  params: { code: string } 
}) {
  // Server-side room validation
  const room = await validateRoom(params.code);
  
  if (!room) {
    notFound();
  }
  
  return (
    <GameProvider roomCode={params.code} initialRoom={room}>
      <GameRoom />
    </GameProvider>
  );
}

// components/game/GameRoom.tsx
// Client Component for interactivity
'use client';

export function GameRoom() {
  const { room, gameState } = useGame();
  const socket = useSocket();
  
  return (
    <div className="game-container">
      <PuzzleBoard />
      <CommunicationPanel />
      <PlayerList />
    </div>
  );
}
```

### 2.2 API Routes

```typescript
// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await createSession();
    
    const response = NextResponse.json({ 
      success: true, 
      session 
    });
    
    // Set secure cookie
    response.cookies.set('session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
```

### 2.3 Image Optimization

```typescript
// components/room/CreateRoomForm.tsx
import Image from 'next/image';
import { useState } from 'react';

export function CreateRoomForm() {
  const [preview, setPreview] = useState<string>('');
  
  const handleImageUpload = async (file: File) => {
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Upload to server
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData
    });
  };
  
  return (
    <div>
      {preview && (
        <Image
          src={preview}
          alt="Puzzle preview"
          width={400}
          height={400}
          className="rounded-lg"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,..."
        />
      )}
    </div>
  );
}
```

### 2.4 Dynamic Imports for Performance

```typescript
// components/communication/VideoGrid.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const WebRTCVideo = dynamic(
  () => import('./WebRTCVideo'),
  { 
    loading: () => <VideoSkeleton />,
    ssr: false // Disable SSR for WebRTC
  }
);

export function VideoGrid() {
  const { peers } = useWebRTC();
  
  return (
    <div className="grid grid-cols-3 gap-2">
      {peers.map(peer => (
        <WebRTCVideo key={peer.id} peer={peer} />
      ))}
    </div>
  );
}
```

## 3. State Management with Zustand

```typescript
// store/gameStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface GameState {
  puzzle: Puzzle | null;
  progress: Map<string, number>;
  isComplete: boolean;
  moves: Move[];
  
  // Actions
  setPuzzle: (puzzle: Puzzle) => void;
  makeMove: (move: Move) => void;
  updateProgress: (playerId: string, progress: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      immer((set) => ({
        puzzle: null,
        progress: new Map(),
        isComplete: false,
        moves: [],
        
        setPuzzle: (puzzle) => set((state) => {
          state.puzzle = puzzle;
        }),
        
        makeMove: (move) => set((state) => {
          state.moves.push(move);
          // Update puzzle state
        }),
        
        updateProgress: (playerId, progress) => set((state) => {
          state.progress.set(playerId, progress);
        }),
        
        resetGame: () => set((state) => {
          state.puzzle = null;
          state.progress.clear();
          state.isComplete = false;
          state.moves = [];
        })
      })),
      {
        name: 'game-storage',
        partialize: (state) => ({ puzzle: state.puzzle })
      }
    )
  )
);
```

## 4. Socket.io Integration

```typescript
// providers/SocketProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ 
  children,
  roomCode 
}: { 
  children: React.ReactNode;
  roomCode?: string;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      transports: ['websocket'],
      query: { roomCode }
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [roomCode]);
  
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return socket;
};
```

## 5. Performance Optimizations

### 5.1 React Query for Server State

```typescript
// hooks/useRoomData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoomDetails, updateRoom } from '@/lib/api/rooms';

export function useRoomData(roomCode: string) {
  return useQuery({
    queryKey: ['room', roomCode],
    queryFn: () => getRoomDetails(roomCode),
    staleTime: 5000,
    refetchInterval: 30000 // Refetch every 30s
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateRoom,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['room', variables.roomCode]
      });
    }
  });
}
```

### 5.2 Optimistic Updates

```typescript
// hooks/useOptimisticMove.ts
export function useOptimisticMove() {
  const { makeMove } = useGameStore();
  const socket = useSocket();
  
  return useCallback((move: Move) => {
    // Optimistically update UI
    makeMove(move);
    
    // Send to server
    socket.emit('game:move', move, (error: Error) => {
      if (error) {
        // Revert on error
        useGameStore.getState().revertMove(move.id);
      }
    });
  }, [makeMove, socket]);
}
```

### 5.3 Next.js Config

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 's3.amazonaws.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  experimental: {
    optimizeCss: true,
  },
  
  webpack: (config, { isServer }) => {
    // Exclude server-only modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        }
      ]
    }
  ]
};

module.exports = nextConfig;
```

## 6. Deployment Considerations

### 6.1 Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# .env.production
NEXT_PUBLIC_API_URL=https://api.puzzlechat.com
NEXT_PUBLIC_WS_URL=wss://api.puzzlechat.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 6.2 Middleware for Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for session
  const session = request.cookies.get('session_id');
  
  // Protect game routes
  if (request.nextUrl.pathname.startsWith('/rooms/') && !session) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: ['/rooms/:path*', '/api/:path*']
};
```