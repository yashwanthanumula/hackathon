'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSocket } from '@/providers/SocketProvider'
import { usePlayerStore } from '@/store/playerStore'

interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: string
}

interface ChatPanelProps {
  roomCode: string
}

export function ChatPanel({ roomCode }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { socket } = useSocket()
  const { playerId, displayName } = usePlayerStore()

  useEffect(() => {
    if (!socket) return

    socket.on('chat:message', (data: ChatMessage) => {
      setMessages((prev) => [...prev, data])
    })

    return () => {
      socket.off('chat:message')
    }
  }, [socket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || !socket || !playerId) return

    socket.emit('chat:message', {
      roomCode,
      playerId,
      playerName: displayName || 'You',
      message: inputMessage.trim(),
    })

    // Add message to local state immediately
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      playerId,
      playerName: displayName || 'You',
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    }])

    setInputMessage('')
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${
              msg.playerId === playerId ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block max-w-[70%] rounded-lg px-3 py-2 ${
                msg.playerId === playerId
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-xs opacity-75 mb-1">{msg.playerName}</p>
              <p className="text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}