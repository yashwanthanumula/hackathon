'use client'

import { useEffect, useState } from 'react'
import { createSession } from '@/lib/api/auth'
import { usePlayerStore } from '@/store/playerStore'

export function useSession() {
  const { sessionId, playerId, displayName, setSession } = usePlayerStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initSession = async () => {
      // Check if we already have a session
      if (sessionId && playerId) {
        setLoading(false)
        return
      }

      try {
        // Create new session
        const session = await createSession()
        setSession(session.sessionId, session.playerId, session.displayName)
      } catch (error) {
        console.error('Failed to create session:', error)
      } finally {
        setLoading(false)
      }
    }

    initSession()
  }, [sessionId, playerId, setSession])

  return {
    sessionId,
    playerId,
    displayName,
    loading,
  }
}