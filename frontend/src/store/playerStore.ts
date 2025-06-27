import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PlayerState {
  sessionId: string | null
  playerId: string | null
  displayName: string | null
  
  setSession: (sessionId: string, playerId: string, displayName: string) => void
  clearSession: () => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      sessionId: null,
      playerId: null,
      displayName: null,
      
      setSession: (sessionId, playerId, displayName) => set({
        sessionId,
        playerId,
        displayName,
      }),
      
      clearSession: () => set({
        sessionId: null,
        playerId: null,
        displayName: null,
      }),
    }),
    {
      name: 'player-storage',
    }
  )
)