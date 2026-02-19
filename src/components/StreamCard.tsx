import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Play } from 'lucide-react';
import { St } from '../types';

interface SCProps {
    s: St;
}

export const SCard: React.FC<SCProps> = ({ s }) => {
    return (
        <Link to={`/watch/${s.id}`} className="group block">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-md group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                <img
                    src={s.thumbnailUrl}
                    alt={s.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded flex items-center gap-1 animate-pulse">
                        LIVE
                    </span>
                </div>

                <div className="absolute top-3 right-3">
                    <div className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-md flex items-center gap-1">
                        <Users size={12} />
                        {s.viewers.toLocaleString()}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wider">{s.category}</p>
                    <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-1">{s.title}</h3>
                    <p className="text-gray-300 text-sm font-medium">{s.hostName}</p>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                        <Play size={24} className="text-white ml-1" fill="currentColor" />
                    </div>
                </div>
            </div>
        </Link>
    );
};
