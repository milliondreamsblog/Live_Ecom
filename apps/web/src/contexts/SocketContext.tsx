import React from 'react';
import { SocketProvider as BaseSocketProvider } from '@livedrop/realtime';
import { SOCKET_URL } from '../config';

/**
 * Web socket provider — wraps the platform-agnostic provider from
 * @livedrop/realtime and injects this app's SOCKET_URL. The socket logic and
 * connection-status tracking now live in the shared package so web and the
 * upcoming mobile app share one implementation.
 */
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BaseSocketProvider url={SOCKET_URL}>{children}</BaseSocketProvider>
);

export { useSocket } from '@livedrop/realtime';
export type { ConnectionStatus } from '@livedrop/realtime';
