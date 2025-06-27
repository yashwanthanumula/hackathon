'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface PuzzlePiece {
  id: string
  correctRow: number
  correctCol: number
  currentPosition: number | null  // null means in tray, number means board position
  isCorrect: boolean
}

interface BoardSlot {
  position: number
  row: number
  col: number
}

interface PuzzleBoardProps {
  imageUrl: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  onComplete?: () => void
  disabled?: boolean
}

export function PuzzleBoard({ imageUrl, difficulty, onComplete, disabled = false }: PuzzleBoardProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [draggedPiece, setDraggedPiece] = useState<PuzzlePiece | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const gridSizes = {
    easy: 3,
    medium: 4,
    hard: 5,
    expert: 6,
  }

  const gridSize = gridSizes[difficulty]
  const totalPieces = gridSize * gridSize

  useEffect(() => {
    // Initialize puzzle pieces
    const newPieces: PuzzlePiece[] = []
    const positions: number[] = []
    
    // Create array of positions to shuffle
    for (let i = 0; i < totalPieces; i++) {
      positions.push(i)
    }
    
    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }
    
    // Create pieces
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const correctPosition = row * gridSize + col
        newPieces.push({
          id: `piece-${row}-${col}`,
          correctRow: row,
          correctCol: col,
          currentPosition: null, // All pieces start in tray
          isCorrect: false,
        })
      }
    }
    
    // Shuffle the pieces array so they appear random in the tray
    for (let i = newPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]]
    }
    
    setPieces(newPieces)
    setIsComplete(false)
  }, [imageUrl, gridSize])

  const handleDragStart = (e: React.DragEvent, piece: PuzzlePiece) => {
    // Don't allow dragging if piece is correctly placed or game is disabled
    if (piece.isCorrect || disabled) {
      e.preventDefault()
      return
    }
    
    setDraggedPiece(piece)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedPiece(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetPosition: number) => {
    e.preventDefault()
    
    if (!draggedPiece || draggedPiece.isCorrect || disabled) return

    const newPieces = [...pieces]
    
    // Find the piece being dragged
    const draggedIndex = newPieces.findIndex(p => p.id === draggedPiece.id)
    if (draggedIndex === -1) return
    
    // Check if target position is already occupied
    const occupyingPiece = newPieces.find(p => p.currentPosition === targetPosition)
    
    if (occupyingPiece && !occupyingPiece.isCorrect) {
      // Swap positions if target is occupied by a non-correct piece
      const occupyingIndex = newPieces.findIndex(p => p.id === occupyingPiece.id)
      newPieces[occupyingIndex].currentPosition = draggedPiece.currentPosition
    } else if (occupyingPiece && occupyingPiece.isCorrect) {
      // Can't drop on a correctly placed piece
      return
    }
    
    // Update the dragged piece's position
    newPieces[draggedIndex].currentPosition = targetPosition
    
    // Check if piece is in correct position
    const targetRow = Math.floor(targetPosition / gridSize)
    const targetCol = targetPosition % gridSize
    newPieces[draggedIndex].isCorrect = 
      targetRow === draggedPiece.correctRow && 
      targetCol === draggedPiece.correctCol
    
    setPieces(newPieces)
    
    // Check if puzzle is complete
    checkCompletion(newPieces)
  }

  const handlePieceDoubleClick = (piece: PuzzlePiece) => {
    // Don't allow removing correctly placed pieces or when game is disabled
    if (piece.isCorrect || piece.currentPosition === null || disabled) return
    
    const newPieces = [...pieces]
    const pieceIndex = newPieces.findIndex(p => p.id === piece.id)
    if (pieceIndex !== -1) {
      newPieces[pieceIndex].currentPosition = null
      newPieces[pieceIndex].isCorrect = false
      setPieces(newPieces)
    }
  }

  const checkCompletion = (currentPieces: PuzzlePiece[]) => {
    const allCorrect = currentPieces.every(p => p.isCorrect)
    if (allCorrect && !isComplete) {
      setIsComplete(true)
      onComplete?.()
    }
  }

  // Get pieces in tray (not placed on board)
  const trayPieces = pieces.filter(p => p.currentPosition === null)

  return (
    <div className="w-full space-y-6">
      {/* Hidden image to preload */}
      <img
        src={imageUrl}
        alt="Puzzle"
        className="hidden"
        onLoad={() => setImageLoaded(true)}
        crossOrigin="anonymous"
      />
      
      {/* Puzzle Board */}
      <div className="flex justify-center">
        <div 
          ref={boardRef}
          className="relative grid gap-1 bg-gray-300 dark:bg-gray-700 p-2 rounded-lg shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            width: 'min(100%, 600px)',
            aspectRatio: '1',
          }}
        >
          {Array.from({ length: totalPieces }).map((_, position) => {
            const row = Math.floor(position / gridSize)
            const col = position % gridSize
            const piece = pieces.find(p => p.currentPosition === position)
            
            return (
              <div
                key={`slot-${position}`}
                className={`relative rounded border-2 border-dashed transition-colors ${
                  piece?.isCorrect 
                    ? 'bg-green-200 dark:bg-green-800 border-green-400 dark:border-green-600' 
                    : 'bg-gray-200 dark:bg-gray-600 border-gray-400 dark:border-gray-500 hover:border-gray-500 dark:hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, position)}
              >
                {piece && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0"
                  >
                    <div
                      className={`w-full h-full ${piece.isCorrect || disabled ? 'cursor-default' : 'cursor-move'}`}
                      draggable={!piece.isCorrect && !disabled}
                      onDragStart={(e) => handleDragStart(e, piece)}
                      onDragEnd={handleDragEnd}
                      onDoubleClick={() => handlePieceDoubleClick(piece)}
                    >
                    <div 
                      className={`w-full h-full rounded overflow-hidden transition-all ${
                        piece.isCorrect 
                          ? 'shadow-lg ring-2 ring-green-400 dark:ring-green-600' 
                          : 'shadow-sm hover:shadow-md'
                      }`}
                      style={{
                        backgroundImage: imageLoaded ? `url(${imageUrl})` : 'none',
                        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                        backgroundPosition: `${-piece.correctCol * 100}% ${-piece.correctRow * 100}%`,
                        imageRendering: 'crisp-edges',
                      }}
                    />
                    {piece.isCorrect && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-green-500 text-white rounded-full p-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                    </div>
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Unplaced Pieces Tray */}
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-lg ${disabled ? 'opacity-50' : ''}`}>
        <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Puzzle Pieces - Drag to the board (double-click to remove from board)
        </h3>
        <div className="min-h-[100px]">
          {trayPieces.length > 0 ? (
            <div className="flex flex-wrap gap-3 justify-center">
              {trayPieces.map((piece) => (
                <motion.div
                  key={piece.id}
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="relative"
                  style={{
                    width: '80px',
                    height: '80px',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className="w-full h-full cursor-move"
                    draggable={!disabled}
                    onDragStart={(e) => handleDragStart(e, piece)}
                    onDragEnd={handleDragEnd}
                  >
                  <div 
                    className="w-full h-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all border-2 border-gray-300 dark:border-gray-600"
                    style={{
                      backgroundImage: imageLoaded ? `url(${imageUrl})` : 'none',
                      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                      backgroundPosition: `${-piece.correctCol * 100}% ${-piece.correctRow * 100}%`,
                      imageRendering: 'crisp-edges',
                    }}
                  >
                    {!imageLoaded && (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
                    )}
                  </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 italic">
                {isComplete ? 'Puzzle completed! 🎉' : 'All pieces are on the board!'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Progress: {pieces.filter(p => p.isCorrect).length} / {totalPieces} pieces correctly placed
      </div>
      
      {/* Completion Modal */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={() => setIsComplete(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center shadow-2xl max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Puzzle Complete! 🎉
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Congratulations! You successfully solved the puzzle!
            </p>
            <button
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              onClick={() => setIsComplete(false)}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}