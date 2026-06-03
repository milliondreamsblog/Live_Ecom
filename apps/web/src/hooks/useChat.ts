import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Msg, Reaction } from '../types';

export const useChat = (roomId: string) => {
    const { socket } = useSocket();
    const [messages, setMessages] = useState<Msg[]>([]);
    const [reactions, setReactions] = useState<Reaction[]>([]);

    useEffect(() => {
        if (!socket || !roomId) return;

        const handleMessage = (m: Msg) => {
            setMessages((prev) => [...prev, m]);
        };

        const handleReaction = (t: string) => {
            const rid = Date.now() + Math.random();
            const rLeft = Math.floor(Math.random() * 40) + 50;

            setReactions(prev => [...prev, { id: rid, type: t, left: rLeft }]);

            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== rid));
            }, 2000);
        };

        const handlePurchase = (d: any) => {
            setMessages(prev => [...prev, {
                id: 'buy-' + Date.now(),
                username: '🛒',
                message: `${d.username} just bought ${d.product.name}! 🎉`,
                timestamp: Date.now(),
                type: 'purchase' as const,
            }]);
        };

        socket.on('receive-message', handleMessage);
        socket.on('receive-reaction', handleReaction);
        socket.on('product-purchased', handlePurchase);

        return () => {
            socket.off('receive-message', handleMessage);
            socket.off('receive-reaction', handleReaction);
            socket.off('product-purchased', handlePurchase);
        };
    }, [socket, roomId]);

    const sendMessage = (username: string, message: string) => {
        if (!socket || !roomId) return;
        socket.emit('send-message', { roomId, username, message });
    };

    const sendReaction = (type: string) => {
        if (!socket || !roomId) return;
        socket.emit('send-reaction', { roomId, type });
    };

    return { messages, reactions, sendMessage, sendReaction };
};
