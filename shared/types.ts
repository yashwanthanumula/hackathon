export interface Room {
  _id: string;
  code: string;
  hostId: string;
  name: string;
  imageUrl: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  maxPlayers: number;
  players: string[];
  status: 'waiting' | 'playing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  _id: string;
  sessionId: string;
  displayName: string;
  avatarUrl?: string;
  currentRoom?: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalPlayTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
}

export interface GameMove {
  pieceId: string;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  playerId: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  roomCode: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: string;
}

export interface Reaction {
  id: string;
  playerId: string;
  playerName: string;
  type: 'thumbs-up' | 'clap' | 'laugh' | 'think' | 'celebrate' | 'heart' | 'fire' | 'shock';
  timestamp: string;
}