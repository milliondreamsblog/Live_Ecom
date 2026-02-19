import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Heart, ThumbsUp, Flame } from 'lucide-react';
import { useChat } from '../hooks/useChat';

interface ChatPanelProps {
    roomId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ roomId }) => {
    const { messages, sendMessage, sendReaction } = useChat(roomId);
    const [text, setText] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        sendMessage('Guest ' + Math.floor(Math.random() * 1000), text);
        setText('');
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center mt-4 opacity-50">
                        <p className="text-xs text-gray-400 italic">Welcome to the chat! Say hello.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                                {msg.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 mr-2">{msg.username}</span>
                                <span className="text-sm text-gray-800 break-words">{msg.message}</span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-2 mb-3">
                    <button onClick={() => sendReaction('heart')} className="flex-1 flex items-center justify-center p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100">
                        <Heart size={18} />
                    </button>
                    <button onClick={() => sendReaction('like')} className="flex-1 flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                        <ThumbsUp size={18} />
                    </button>
                    <button onClick={() => sendReaction('fire')} className="flex-1 flex items-center justify-center p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100">
                        <Flame size={18} />
                    </button>
                </div>
                <form className="relative" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Say something..."
                        className="w-full bg-gray-100 border-none rounded-full pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                    <button type="submit" disabled={!text.trim()} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50">
                        <MessageCircle size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};
