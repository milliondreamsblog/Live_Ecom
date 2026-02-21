import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Heart, ThumbsUp, Flame } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../contexts/AuthContext';

interface ChatPanelProps {
    roomId: string;
}

const HINGLISH_QUICK = [
    'Wah Wah! 🙌',
    'Ekdum Mast! 🔥',
    'Le Lo Le Lo! 🛍️',
    'Ek Number! 💯',
    'Bahut Sahi! 👌',
    'Dhamakedaar! 💥',
];

export const ChatPanel: React.FC<ChatPanelProps> = ({ roomId }) => {
    const { messages, sendMessage, sendReaction } = useChat(roomId);
    const { user } = useAuth();
    const [text, setText] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const INDIAN_NAMES = ['Aarav', 'Neha', 'Priya', 'Rahul', 'Aditya', 'Riya', 'Karan', 'Sneha', 'Vikram', 'Pooja', 'Rohan', 'Anjali', 'Kavita', 'Sanjay', 'Amit'];
    const getUsername = () => user?.name || `Guest ${INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)]}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        sendMessage(getUsername(), text);
        setText('');
    };

    const sendQuick = (msg: string) => {
        sendMessage(getUsername(), msg);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center mt-4 opacity-50">
                        <p className="text-xs text-gray-400 italic">Namaste! Chat mein aao 🙏</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        msg.type === 'purchase' ? (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
                                <span className="text-lg">🛒</span>
                                <span className="text-sm text-green-700 font-semibold">{msg.message}</span>
                            </div>
                        ) : (
                            <div key={idx} className="flex items-start gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${msg.username === user?.name
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {msg.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <span className={`text-xs font-bold mr-2 ${msg.username === user?.name ? 'text-purple-600' : 'text-gray-500'}`}>
                                        {msg.username}
                                    </span>
                                    <span className="text-sm text-gray-800 break-words">{msg.message}</span>
                                </div>
                            </div>
                        )
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 bg-white space-y-2">
                {/* Reaction buttons */}
                <div className="flex gap-2">
                    <button onClick={() => sendReaction('heart')} className="flex-1 flex items-center justify-center p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors">
                        <Heart size={18} />
                    </button>
                    <button onClick={() => sendReaction('like')} className="flex-1 flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        <ThumbsUp size={18} />
                    </button>
                    <button onClick={() => sendReaction('fire')} className="flex-1 flex items-center justify-center p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
                        <Flame size={18} />
                    </button>
                </div>

                {/* Hinglish quick messages */}
                <div className="flex gap-1.5 flex-wrap">
                    {HINGLISH_QUICK.map((q) => (
                        <button
                            key={q}
                            onClick={() => sendQuick(q)}
                            className="text-[11px] px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full hover:bg-orange-100 transition-colors font-medium"
                        >
                            {q}
                        </button>
                    ))}
                </div>

                {/* Text input */}
                <form className="relative" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={user ? `Bol, ${user.name.split(' ')[0]}...` : 'Say something...'}
                        maxLength={200}
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
