import { Server, Socket } from 'socket.io';

export const handleGameEvents = (io: Server, socket: Socket) => {
  socket.on('game:start', (data: { roomCode: string }) => {
    const { roomCode } = data;
    
    // Notify all players in the room
    io.to(roomCode).emit('game:started', {
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('game:move', (data: { roomCode: string; playerId: string; move: any }) => {
    const { roomCode, playerId, move } = data;
    
    // Broadcast move to other players
    socket.to(roomCode).emit('game:move', {
      playerId,
      move,
    });
  });

  socket.on('game:complete', (data: { roomCode: string; playerId: string; displayName: string; time: number }) => {
    const { roomCode, playerId, displayName, time } = data;
    
    // Notify all players
    io.to(roomCode).emit('game:completed', {
      winnerId: playerId,
      winnerName: displayName,
      completionTime: time,
    });
  });
};