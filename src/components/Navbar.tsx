import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, Home, User } from 'lucide-react';

export const Navbar: React.FC = () => {
    const loc = useLocation();

    const act = (p: string) => loc.pathname === p;

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white">
                                <Video size={20} />
                            </div>
                            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                                LiveShop
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${act('/') ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Home size={18} />
                                <span className="hidden sm:inline">Browse</span>
                            </div>
                        </Link>
                        <Link
                            to="/host"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${act('/host') ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Video size={18} />
                                <span className="hidden sm:inline">Go Live</span>
                            </div>
                        </Link>
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-300 transition-colors">
                            <User size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
