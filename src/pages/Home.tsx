import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SCard } from '../components/StreamCard';
import { St } from '../types';
import { Flame, TrendingUp, Radio } from 'lucide-react';
import { SOCKET_URL } from '../config';

export const Home: React.FC = () => {
    const [streams, setStreams] = useState<St[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStreams = () => {
            fetch(`${SOCKET_URL}/api/streams`)
                .then((res) => res.json())
                .then((data) => {
                    setStreams(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        };

        fetchStreams();
        const interval = setInterval(fetchStreams, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="bg-white border-b border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                            Discover Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Shopping</span>
                        </h1>
                        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                            Watch real-time product demos, interact with hosts, and shop the latest trends instantly.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center gap-2 mb-6">
                    <Flame className="text-orange-500" />
                    <h2 className="text-2xl font-bold text-gray-900">Live Now</h2>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-500">Loading streams...</p>
                    </div>
                ) : streams.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                        <Radio className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No Live Streams Right Now</h3>
                        <p className="text-gray-500 mb-6">Be the first to go live and start selling!</p>
                        <Link
                            to="/host"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-purple-600/25 transition-all"
                        >
                            Start Streaming
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {streams.map((s) => (
                                <SCard key={s.id} s={s} />
                            ))}
                        </div>

                        {streams.length >= 4 && (
                            <div className="mt-16">
                                <div className="flex items-center gap-2 mb-6">
                                    <TrendingUp className="text-blue-500" />
                                    <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {streams.slice(0, 4).map((s) => (
                                        <SCard key={`rec-${s.id}`} s={s} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};
