import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    status: ConnectionStatus;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
    status: 'connecting',
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Hold the socket in state (not a ref) so the instance is exposed to
    // consumers on the very next render, instead of only after the first
    // successful connection. Otherwise a slow/unreachable backend leaves the
    // whole app with socket === null and no way to attach listeners.
    const [socket, setSocket] = useState<Socket | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>('connecting');

    useEffect(() => {
        const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
        setSocket(s);

        const onConnect = () => {
            console.log('Socket connected:', s.id);
            setStatus('connected');
        };
        const onDisconnect = () => {
            console.log('Socket disconnected');
            setStatus('disconnected');
        };
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
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected: status === 'connected', status }}>
            {children}
        </SocketContext.Provider>
    );
};
