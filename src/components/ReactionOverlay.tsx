import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Reaction } from '../types';

export const ReactionOverlay: React.FC = () => {
    const { socket } = useSocket();
    const [reactions, setReactions] = useState<Reaction[]>([]);

    useEffect(() => {
        if (!socket) return;

        const handleReaction = (type: string) => {
            const id = Date.now() + Math.random();
            const left = Math.floor(Math.random() * 40) + 50;

            setReactions(prev => [...prev, { id, type, left }]);

            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== id));
            }, 2000);
        };

        socket.on('receive-reaction', handleReaction);
        return () => {
            socket.off('receive-reaction', handleReaction);
        };
    }, [socket]);

    return (
        <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
            {reactions.map(r => (
                <div
                    key={r.id}
                    className="absolute bottom-20 text-4xl animate-float"
                    style={{ left: `${r.left}%` }}
                >
                    {r.type === 'heart' && '❤️'}
                    {r.type === 'like' && '👍'}
                    {r.type === 'fire' && '🔥'}
                </div>
            ))}
        </div>
    );
};
