import { apiClient } from './client'
import { Room } from '@/types/room'

interface CreateRoomData {
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  imageUrl: string
  hostId: string
}

export async function createRoom(data: CreateRoomData): Promise<Room> {
  return apiClient<Room>('/api/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getRoom(code: string): Promise<Room> {
  return apiClient<Room>(`/api/rooms/${code}`)
}

export async function joinRoom(code: string, playerId: string): Promise<Room> {
  return apiClient<Room>(`/api/rooms/${code}/join`, {
    method: 'POST',
    body: JSON.stringify({ playerId }),
  })
}