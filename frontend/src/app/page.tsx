'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function HomePage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomCode.trim()) {
      router.push(`/rooms/${roomCode.toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            PuzzleChat
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Play image puzzles with friends in real-time
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
          <div>
            <Link href="/rooms/create">
              <Button size="lg" className="w-full">
                Create New Room
              </Button>
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or join existing room
              </span>
            </div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-center text-2xl font-mono"
            />
            <Button type="submit" variant="secondary" className="w-full">
              Join Room
            </Button>
          </form>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Create a room and share the code with friends</p>
          <p>Up to 8 players can join a single room</p>
        </div>
      </div>
    </div>
  )
}