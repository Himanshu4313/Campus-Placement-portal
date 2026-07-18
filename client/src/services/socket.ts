import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initiateSocket = (token: string) => {
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket'],
  });
  console.log('🔌 Connecting socket...');
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToNotifications = (callback: (notification: any) => void) => {
  if (!socket) return;
  socket.on('notification:new', (data) => {
    callback(data);
  });
};

export const subscribeToAnnouncements = (callback: (announcement: any) => void) => {
  if (!socket) return;
  socket.on('notification:announcement', (data) => {
    callback(data);
  });
};

export const emitEvent = (event: string, data: any) => {
  if (socket) socket.emit(event, data);
};

export const getSocket = () => socket;
