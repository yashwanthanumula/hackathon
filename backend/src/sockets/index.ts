import { Server, Socket } from 'socket.io';
import { handleRoomEvents } from './roomHandlers';
import { handleGameEvents } from './gameHandlers';
import { handleChatEvents } from './chatHandlers';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('✅ New client connected:', socket.id, 'from', socket.handshake.address);

    // Send connection confirmation
    socket.emit('connected', { socketId: socket.id });

    // Set up event handlers
    handleRoomEvents(io, socket);
    handleGameEvents(io, socket);
    handleChatEvents(io, socket);

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Client disconnected:', socket.id, 'Reason:', reason);
    });
  });

  io.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
  });
};