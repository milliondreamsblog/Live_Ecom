import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { PollData } from '../types';

export const usePolls = (roomId: string) => {
    const { socket } = useSocket();
    const [currentPoll, setCurrentPoll] = useState<PollData | null>(null);

    useEffect(() => {
        if (!socket || !roomId) return;

        const handleNewPoll = (p: PollData) => setCurrentPoll(p);
        const handleUpdatePoll = (p: PollData) => setCurrentPoll(p);
        const handleEndPoll = () => setCurrentPoll(null);

        socket.on('new-poll', handleNewPoll);
        socket.on('current-poll', handleNewPoll);
        socket.on('update-poll-results', handleUpdatePoll);
        socket.on('poll-ended', handleEndPoll);

        return () => {
            socket.off('new-poll', handleNewPoll);
            socket.off('current-poll', handleNewPoll);
            socket.off('update-poll-results', handleUpdatePoll);
            socket.off('poll-ended', handleEndPoll);
        };
    }, [socket, roomId]);

    const createPoll = (question: string, options: string[]) => {
        if (!socket) return;
        socket.emit('create-poll', { roomId, question, options });
    };

    const votePoll = (optionIndex: number) => {
        if (!socket) return;
        socket.emit('vote-poll', { roomId, optionIndex });
    };

    const endPoll = () => {
        if (!socket) return;
        socket.emit('end-poll', { roomId });
    };

    return { currentPoll, createPoll, votePoll, endPoll };
};
