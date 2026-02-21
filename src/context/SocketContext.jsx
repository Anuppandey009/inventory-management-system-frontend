import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, tenant } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user || !tenant) return;

    const s = io('/', { transports: ['websocket', 'polling'] });

    s.on('connect', () => {
      s.emit('join-tenant', tenant.id);
    });

    setSocket(s);

    return () => {
      s.emit('leave-tenant', tenant.id);
      s.disconnect();
    };
  }, [user, tenant]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
