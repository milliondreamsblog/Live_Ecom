import React, { useState } from 'react';
import { X, Video, ShoppingBag, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const { login } = useAuth();
    const [name, setName] = useState('Rahul Kumar');
    const [role, setRole] = useState<'host' | 'viewer'>('viewer');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        login(name.trim(), role);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={20} />
                        <span className="text-sm font-semibold uppercase tracking-wider">LiveShop India</span>
                    </div>
                    <h2 className="text-2xl font-bold">Namaste! 🙏</h2>
                    <p className="text-purple-100 text-sm mt-1">Join India's favourite live shopping experience</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Aapka naam kya hai? (Your Name)
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Priya Sharma"
                            maxLength={30}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Role selector */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Main hoon...
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('viewer')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === 'viewer'
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <ShoppingBag size={24} />
                                <span className="font-bold text-sm">Buyer / Viewer</span>
                                <span className="text-xs text-center opacity-70">Watch & shop live deals</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('host')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === 'host'
                                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <Video size={24} />
                                <span className="font-bold text-sm">Host / Seller</span>
                                <span className="text-xs text-center opacity-70">Go live & sell products</span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-base hover:shadow-lg hover:shadow-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Shuru Karo! 🚀
                    </button>
                    <p className="text-center text-xs text-gray-400">
                        No password needed — yeh toh desi MVP hai! 😄
                    </p>
                </form>
            </div>
        </div>
    );
};
