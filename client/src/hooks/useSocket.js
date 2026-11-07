import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext.jsx';

function getSocketUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/api\/v1\/?$/, '');
  return 'http://localhost:5000';
}

export default function useSocket(handlers = {}) {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => console.log('🔌 socket connected'));
    socket.on('connect_error', (e) => console.warn('socket error:', e.message));

    for (const [event, handler] of Object.entries(handlers)) {
      socket.on(event, handler);
    }

    return () => {
      for (const event of Object.keys(handlers)) socket.off(event);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return socketRef;
}
