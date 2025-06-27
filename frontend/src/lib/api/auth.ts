import { apiClient } from './client'

interface SessionResponse {
  sessionId: string
  playerId: string
  displayName: string
}

export async function createSession(displayName?: string): Promise<SessionResponse> {
  return apiClient<SessionResponse>('/api/players/session', {
    method: 'POST',
    body: JSON.stringify({ displayName }),
  })
}