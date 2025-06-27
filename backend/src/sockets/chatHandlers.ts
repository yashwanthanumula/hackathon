import { Server, Socket } from 'socket.io';

export const handleChatEvents = (_io: Server, socket: Socket) => {
  socket.on('chat:message', (data: { roomCode: string; playerId: string; message: string; playerName?: string }) => {
    const { roomCode, playerId, message, playerName } = data;
    
    // Broadcast message to all in room EXCEPT sender
    socket.to(roomCode).emit('chat:message', {
      id: Date.now().toString(),
      playerId,
      playerName: playerName || 'Player',
      message,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('reaction:send', (data: { roomCode: string; playerId: string; playerName?: string; reaction: string }) => {
    const { roomCode, playerId, playerName, reaction } = data;
    
    console.log(`Reaction from ${playerName} (${playerId}) in room ${roomCode}: ${reaction}`);
    console.log(`Socket ${socket.id} rooms:`, Array.from(socket.rooms));
    
    // Broadcast reaction to all in room EXCEPT sender
    socket.to(roomCode).emit('reaction:received', {
      playerId,
      playerName: playerName || 'Player',
      reaction,
      timestamp: new Date().toISOString(),
    });
  });
};