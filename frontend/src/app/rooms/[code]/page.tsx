'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { useSession } from '@/hooks/useSession'
import { getRoom, joinRoom } from '@/lib/api/rooms'
import { Room } from '@/types/room'
import { PuzzleBoard } from '@/components/game/PuzzleBoard'
import { ChatPanel } from '@/components/communication/ChatPanel'
import { ReactionBar } from '@/components/communication/ReactionBar'
import { useSocket } from '@/providers/SocketProvider'
import { usePlayerStore } from '@/store/playerStore'
import { SocketDebug } from '@/components/debug/SocketDebug'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const { playerId, displayName, loading: sessionLoading } = useSession()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [winner, setWinner] = useState<{ playerId: string; displayName: string } | null>(null)
  const { socket } = useSocket()

  const roomCode = params.code as string

  useEffect(() => {
    let mounted = true
    
    if (!sessionLoading && playerId && mounted) {
      loadRoom()
    }
    
    return () => {
      mounted = false
    }
  }, [roomCode, playerId, sessionLoading])

  useEffect(() => {
    if (!socket || !room || !playerId) return

    // Join socket room
    console.log('Joining socket room:', { roomCode, playerId, socketId: socket.id })
    socket.emit('room:join', { roomCode, playerId })

    // Listen for game events
    const handleGameStarted = () => {
      setGameStarted(true)
    }

    const handlePlayerJoined = ({ playerId: newPlayerId }: any) => {
      // Debounce room reload to prevent too many requests
      setTimeout(() => loadRoom(), 500)
    }

    const handlePlayerLeft = ({ playerId: leftPlayerId }: any) => {
      // Debounce room reload to prevent too many requests
      setTimeout(() => loadRoom(), 500)
    }

    const handleGameCompleted = ({ winnerId, winnerName, time }: any) => {
      setGameCompleted(true)
      setWinner({ playerId: winnerId, displayName: winnerName })
      
      // Play completion sound
      try {
        const audio = new Audio('/sounds/puzzle-complete.mp3')
        audio.play().catch(() => {
          // Fallback: Use Web Audio API to create a simple success sound
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.5)
        })
      } catch (e) {
        console.log('Audio playback not available')
      }
    }

    socket.on('game:started', handleGameStarted)
    socket.on('player:joined', handlePlayerJoined)
    socket.on('player:left', handlePlayerLeft)
    socket.on('game:completed', handleGameCompleted)

    return () => {
      socket.emit('room:leave', { roomCode, playerId })
      socket.off('game:started', handleGameStarted)
      socket.off('player:joined', handlePlayerJoined)
      socket.off('player:left', handlePlayerLeft)
      socket.off('game:completed', handleGameCompleted)
    }
  }, [socket, room?.code, playerId]) // Only depend on room.code to prevent infinite loops

  const loadRoom = async () => {
    try {
      const roomData = await getRoom(roomCode)
      setRoom(roomData)
      
      // Join room if not already joined
      if (playerId && !roomData.players.includes(playerId)) {
        const updatedRoom = await joinRoom(roomCode, playerId)
        setRoom(updatedRoom)
      }

      // Set game started if room is playing
      if (roomData.status === 'playing') {
        setGameStarted(true)
      }
    } catch (err: any) {
      setError(err.message || 'Room not found')
    } finally {
      setLoading(false)
    }
  }

  const startGame = () => {
    if (!socket || !room || room.hostId !== playerId) return
    
    socket.emit('game:start', { roomCode })
    setGameStarted(true)
  }

  const handlePuzzleComplete = () => {
    if (!socket || gameCompleted) return
    
    socket.emit('game:complete', {
      roomCode,
      playerId,
      displayName,
      time: Date.now(),
    })
  }

  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="text-xl">Loading room...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="text-xl text-red-600 dark:text-red-400 mb-4">{error}</div>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-6xl mx-auto mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {room?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Room Code: <span className="font-mono font-bold">{roomCode}</span>
              </p>
            </div>
            <Button onClick={() => router.push('/')}>Leave Room</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {!gameStarted ? (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 flex flex-col items-center justify-center h-[600px]">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    Waiting to Start
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                    {room?.players.length || 0} / {room?.maxPlayers || 8} players joined
                  </p>
                  {room?.hostId === playerId && (
                    <Button
                      onClick={startGame}
                      size="lg"
                      disabled={!room || room.players.length < 2}
                    >
                      Start Game
                    </Button>
                  )}
                  {room?.hostId !== playerId && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Waiting for host to start the game...
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <PuzzleBoard
                    imageUrl={room?.imageUrl || ''}
                    difficulty={room?.difficulty || 'medium'}
                    onComplete={handlePuzzleComplete}
                    disabled={gameCompleted}
                  />
                  {room?.description && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                        Image Description
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {gameCompleted ? room.description : 'Complete the puzzle to reveal the description!'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Players ({room?.players.length || 0})
                </h3>
                <div className="space-y-2">
                  {room?.players.map((player, index) => (
                    <div
                      key={player}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {player === playerId ? displayName : `Player ${index + 1}`}
                      </span>
                      {room.hostId === player && (
                        <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded">
                          Host
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[400px]">
                <ChatPanel roomCode={roomCode} />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <ReactionBar roomCode={roomCode} />
          </div>
        </div>
      </div>

      {/* Game Completion Modal */}
      {gameCompleted && winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center shadow-2xl max-w-lg mx-4"
          >
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                Puzzle Completed!
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {winner.playerId === playerId ? 'You won!' : `${winner.displayName} won!`}
              </p>
            </div>
            
            {room?.description && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Image Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {room.description}
                </p>
              </div>
            )}
            
            <Button onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </motion.div>
        </motion.div>
      )}
      
      {/* Debug info */}
      <SocketDebug />
    </div>
  )
}