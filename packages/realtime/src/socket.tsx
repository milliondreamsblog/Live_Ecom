import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { ServerEvents, ClientEvents, AppSocket } from './events';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface SocketContextValue {
  socket: AppSocket | null;
  connected: boolean;
  status: ConnectionStatus;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  status: 'connecting',
});

export const useSocket = () => useContext(SocketContext);

export interface SocketProviderProps {
  /** Backend URL (platform-specific, injected by each app). */
  url: string;
  children: React.ReactNode;
}

/**
 * Platform-agnostic Socket.IO provider (works in React DOM and React Native).
 * Holds the socket in state so consumers get the instance on the next render
 * — not only after the first successful connection — and exposes a
 * connecting/connected/disconnected status for the UI to surface.
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({ url, children }) => {
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    const s = io<ServerEvents, ClientEvents>(url, {
      transports: ['websocket', 'polling'],
    });
    setSocket(s);

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onError = () => setStatus('disconnected');

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onError);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('connect_error', onError);
      s.disconnect();
    };
  }, [url]);

  return (
    <SocketContext.Provider value={{ socket, connected: status === 'connected', status }}>
      {children}
    </SocketContext.Provider>
  );
};
