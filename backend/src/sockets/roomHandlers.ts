import { Server, Socket } from 'socket.io';

export const handleRoomEvents = (_io: Server, socket: Socket) => {
  socket.on('room:join', async (data: { roomCode: string; playerId: string }) => {
    const { roomCode, playerId } = data;
    
    // Join socket room
    socket.join(roomCode);
    
    // Notify others in the room
    socket.to(roomCode).emit('player:joined', {
      playerId,
      socketId: socket.id,
    });
    
    console.log(`Player ${playerId} joined room ${roomCode}`);
  });

  socket.on('room:leave', (data: { roomCode: string; playerId: string }) => {
    const { roomCode, playerId } = data;
    
    // Leave socket room
    socket.leave(roomCode);
    
    // Notify others in the room
    socket.to(roomCode).emit('player:left', {
      playerId,
      socketId: socket.id,
    });
    
    console.log(`Player ${playerId} left room ${roomCode}`);
  });
};