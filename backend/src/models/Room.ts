import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
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

const roomSchema = new Schema<IRoom>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 6,
  },
  hostId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium',
  },
  maxPlayers: {
    type: Number,
    default: 8,
    min: 2,
    max: 8,
  },
  players: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['waiting', 'playing', 'completed'],
    default: 'waiting',
  },
}, {
  timestamps: true,
});

// Indexes
// code already has unique index from schema definition
roomSchema.index({ status: 1, createdAt: -1 });

export const Room = mongoose.model<IRoom>('Room', roomSchema);