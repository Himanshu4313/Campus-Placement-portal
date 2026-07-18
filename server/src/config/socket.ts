import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: SocketServer;

export const initializeSocket = (server: HTTPServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
      (socket as any).userId = decoded.id;
      (socket as any).role = decoded.role;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`🔌 User connected: ${userId} (${socket.id})`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join role room
    const role = (socket as any).role;
    socket.join(`role:${role}`);

    socket.on('join:room', (roomId: string) => {
      socket.join(roomId);
    });

    socket.on('leave:room', (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on('typing:start', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('typing:start', { userId, socketId: socket.id });
    });

    socket.on('typing:stop', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('typing:stop', { userId, socketId: socket.id });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${userId} (${socket.id})`);
    });
  });

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToRole = (role: string, event: string, data: any): void => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

export const emitToAll = (event: string, data: any): void => {
  if (io) {
    io.emit(event, data);
  }
};
