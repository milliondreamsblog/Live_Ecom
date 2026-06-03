import { useState, useEffect } from 'react';
import { useSocket } from '@livedrop/realtime';
import type { Message, Reaction } from '@livedrop/core';

/**
 * Headless chat: messages, flying reactions and purchase notices for a room.
 * Platform-agnostic — consumed identically by web and (later) mobile.
 */
export const useChat = (roomId: string) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleMessage = (m: Message) => {
      setMessages((prev) => [...prev, m]);
    };

    const handleReaction = (t: string) => {
      const id = Date.now() + Math.random();
      const left = Math.floor(Math.random() * 40) + 50;
      setReactions((prev) => [...prev, { id, type: t, left }]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2000);
    };

    const handlePurchase = (d: {
      username: string;
      product: { id: number; name: string; price: number };
    }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: 'buy-' + Date.now(),
          username: '🛒',
          message: `${d.username} just bought ${d.product.name}! 🎉`,
          timestamp: Date.now(),
          type: 'purchase' as const,
        },
      ]);
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
