'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '@/providers/SocketProvider'
import { usePlayerStore } from '@/store/playerStore'
import { useState, useEffect, useCallback } from 'react'

interface Reaction {
  id: string
  playerId: string
  playerName: string
  type: string
  timestamp: string
}

interface ReactionBarProps {
  roomCode: string
}

const reactions = [
  { type: 'thumbs-up', emoji: '👍', label: 'Like', soundFreq: 523.25, duration: 0.1 },
  { type: 'clap', emoji: '👏', label: 'Clap', soundFreq: 659.25, duration: 0.15 },
  { type: 'laugh', emoji: '😂', label: 'Laugh', soundFreq: 440, duration: 0.3 },
  { type: 'think', emoji: '🤔', label: 'Thinking', soundFreq: 349.23, duration: 0.4 },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate', soundFreq: 783.99, duration: 0.2 },
  { type: 'heart', emoji: '❤️', label: 'Love', soundFreq: 698.46, duration: 0.25 },
  { type: 'fire', emoji: '🔥', label: 'Fire', soundFreq: 587.33, duration: 0.15 },
  { type: 'shock', emoji: '😱', label: 'Shocked', soundFreq: 293.66, duration: 0.3 },
]

export function ReactionBar({ roomCode }: ReactionBarProps) {
  const { socket, connected } = useSocket()
  const { playerId, displayName } = usePlayerStore()
  const [floatingReactions, setFloatingReactions] = useState<Reaction[]>([])
  const [isReady, setIsReady] = useState(false)

  const playReactionSound = useCallback((type: string) => {
    const reaction = reactions.find(r => r.type === type)
    if (!reaction) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different sound patterns for different reactions
      if (type === 'clap') {
        // Clapping sound - quick bursts
        oscillator.frequency.setValueAtTime(reaction.soundFreq, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.05)
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + reaction.duration)
      } else if (type === 'laugh') {
        // Laughing sound - oscillating
        oscillator.frequency.setValueAtTime(reaction.soundFreq, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(reaction.soundFreq * 1.2, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(reaction.soundFreq, audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + reaction.duration)
      } else if (type === 'celebrate') {
        // Celebration sound - ascending
        oscillator.frequency.setValueAtTime(reaction.soundFreq * 0.5, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(reaction.soundFreq * 2, audioContext.currentTime + reaction.duration)
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + reaction.duration)
      } else {
        // Default sound
        oscillator.frequency.setValueAtTime(reaction.soundFreq, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + reaction.duration)
      }
      
      oscillator.type = type === 'think' ? 'sine' : 'triangle'
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + reaction.duration)
    } catch (e) {
      console.log('Audio not available')
    }
  }, [])

  // Check if ready (socket connected and room joined)
  useEffect(() => {
    setIsReady(connected && !!socket && !!playerId && !!roomCode)
  }, [connected, socket, playerId, roomCode])

  useEffect(() => {
    if (!socket) return

    const handleReactionReceived = (data: any) => {
      console.log('Reaction received:', data)
      const reaction = { 
        ...data, 
        id: Date.now().toString() + Math.random(),
        type: data.reaction,
        playerName: data.playerName || 'Player'
      }
      setFloatingReactions((prev) => [...prev, reaction])
      
      // Play sound for the reaction
      playReactionSound(reaction.type)
      
      // Remove reaction after animation
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== reaction.id))
      }, 3000)
    }

    socket.on('reaction:received', handleReactionReceived)

    return () => {
      socket.off('reaction:received', handleReactionReceived)
    }
  }, [socket, playReactionSound])

  const sendReaction = (type: string) => {
    if (!socket || !playerId) {
      console.log('Cannot send reaction:', { socket: !!socket, playerId, connected })
      return
    }

    console.log('Sending reaction:', { type, roomCode, playerId, playerName: displayName, connected, socketId: socket.id })
    
    socket.emit('reaction:send', {
      roomCode,
      playerId,
      playerName: displayName || 'You',
      reaction: type,
    })

    // Show local reaction immediately
    const reaction: Reaction = {
      id: Date.now().toString(),
      playerId,
      playerName: displayName || 'You',
      type,
      timestamp: new Date().toISOString(),
    }
    
    setFloatingReactions((prev) => [...prev, reaction])
    
    // Play sound locally
    playReactionSound(type)
    
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== reaction.id))
    }, 3000)
  }

  return (
    <>
      <div className="flex gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative">
        {/* Connection indicator */}
        <div className={`absolute -top-2 -right-2 w-3 h-3 rounded-full ${
          connected ? 'bg-green-500' : 'bg-red-500'
        } ${connected ? 'animate-pulse' : ''}`} 
        title={connected ? 'Connected' : 'Disconnected'} />
        
        {reactions.map((reaction) => (
          <button
            key={reaction.type}
            onClick={() => sendReaction(reaction.type)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!isReady ? 'Connecting...' : reaction.label}
            disabled={!isReady}
          >
            <span className="text-2xl">{reaction.emoji}</span>
          </button>
        ))}
      </div>

      {/* Floating reactions */}
      <div className="fixed bottom-20 right-4 pointer-events-none z-50" style={{ width: '300px', height: '400px' }}>
        <AnimatePresence mode="popLayout">
          {floatingReactions.slice(-5).map((reaction, index) => {
            const reactionEmoji = reactions.find((r) => r.type === reaction.type)?.emoji || '👍'
            const isOwnReaction = reaction.playerId === playerId
            const xOffset = Math.random() * 60 - 30
            
            return (
              <motion.div
                key={reaction.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.5, x: 0 }}
                animate={{ 
                  opacity: 1, 
                  y: -50 - (index * 80), 
                  scale: 1,
                  x: xOffset
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  duration: 0.5 
                }}
                className="absolute bottom-0 right-0 flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-full shadow-xl border border-gray-200 dark:border-gray-700"
              >
                <motion.span 
                  className="text-2xl"
                  initial={{ rotate: -20 }}
                  animate={{ rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {reactionEmoji}
                </motion.span>
                <span className={`text-sm font-semibold whitespace-nowrap ${
                  isOwnReaction 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {reaction.playerName || 'Anonymous'}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}