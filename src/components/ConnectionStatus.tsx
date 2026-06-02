import React from 'react';
import { Loader2, WifiOff } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

/**
 * Small fixed banner that surfaces socket connection trouble. Stays hidden
 * while connected so it never gets in the way; shows "connecting" on first
 * load (incl. Render free-tier cold starts) and "reconnecting" on drops.
 */
export const ConnectionStatus: React.FC = () => {
    const { status } = useSocket();

    if (status === 'connected') return null;

    const connecting = status === 'connecting';

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-medium text-white bg-gray-900/90 backdrop-blur-sm border border-white/10">
            {connecting ? (
                <Loader2 size={16} className="animate-spin text-purple-400" />
            ) : (
                <WifiOff size={16} className="text-red-400" />
            )}
            <span>
                {connecting
                    ? 'Connecting to server…'
                    : 'Disconnected — reconnecting…'}
            </span>
        </div>
    );
};
