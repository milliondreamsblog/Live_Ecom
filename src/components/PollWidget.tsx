import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { usePolls } from '../hooks/usePolls';

interface PollWidgetProps {
    roomId: string;
}

export const PollWidget: React.FC<PollWidgetProps> = ({ roomId }) => {
    const { currentPoll, votePoll } = usePolls(roomId);
    const [votedIndex, setVotedIndex] = useState<number | null>(null);

    if (!currentPoll) return null;

    const totalVotes = currentPoll.options.reduce((acc, curr) => acc + curr.votes, 0);

    const handleVote = (idx: number) => {
        if (votedIndex !== null) return;
        setVotedIndex(idx);
        votePoll(idx);
    };

    return (
        <div className="absolute top-20 right-6 w-64 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl z-50 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 text-sm leading-snug">{currentPoll.question}</h3>
                <BarChart2 size={16} className="text-blue-500" />
            </div>

            <div className="space-y-2">
                {currentPoll.options.map((opt, i) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

                    if (votedIndex !== null) {
                        return (
                            <div key={i} className="relative">
                                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1 z-10 relative">
                                    <span>{opt.text}</span>
                                    <span>{pct}%</span>
                                </div>
                                <div className="h-8 bg-gray-100 rounded-md overflow-hidden relative">
                                    <div
                                        className={`h-full transition-all duration-500 ${votedIndex === i ? 'bg-blue-500' : 'bg-gray-300'}`}
                                        style={{ width: `${pct}%` }}
                                    ></div>
                                    {votedIndex === i && (
                                        <div className="absolute inset-0 flex items-center justify-end px-2">
                                            <span className="text-xs text-white font-bold">✓</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <button
                                key={i}
                                onClick={() => handleVote(i)}
                                className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-all"
                            >
                                {opt.text}
                            </button>
                        );
                    }
                })}
            </div>
            <div className="mt-2 text-right">
                <span className="text-xs text-gray-500">{totalVotes} votes</span>
            </div>
        </div>
    );
};
