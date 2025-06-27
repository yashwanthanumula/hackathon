export interface Room {
  _id: string
  code: string
  hostId: string
  name: string
  imageUrl: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  maxPlayers: number
  players: string[]
  status: 'waiting' | 'playing' | 'completed'
  createdAt: string
  updatedAt: string
}