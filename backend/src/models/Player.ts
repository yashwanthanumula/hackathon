import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer extends Document {
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

const playerSchema = new Schema<IPlayer>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  avatarUrl: {
    type: String,
  },
  currentRoom: {
    type: String,
  },
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    gamesWon: {
      type: Number,
      default: 0,
    },
    totalPlayTime: {
      type: Number,
      default: 0,
    },
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
playerSchema.index({ sessionId: 1 });
playerSchema.index({ currentRoom: 1 });

export const Player = mongoose.model<IPlayer>('Player', playerSchema);