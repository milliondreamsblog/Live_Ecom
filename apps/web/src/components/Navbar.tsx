import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, Home, LogOut, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

export const Navbar: React.FC = () => {
    const loc = useLocation();
    const { user, logout } = useAuth();
    const [showAuth, setShowAuth] = useState(false);

    const act = (p: string) => loc.pathname === p;

    return (
        <>
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
                                <span className="hidden sm:inline text-xs text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full">🇮🇳 India</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${act('/') ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Home size={18} />
                                    <span className="hidden sm:inline">Browse</span>
                                </div>
                            </Link>

                            {/* Only show Go Live if logged in as host */}
                            {user?.role === 'host' && (
                                <Link
                                    to="/host"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${act('/host') ? 'text-pink-600 bg-pink-50' : 'text-gray-600 hover:text-pink-600 hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Video size={18} />
                                        <span className="hidden sm:inline">Go Live</span>
                                    </div>
                                </Link>
                            )}

                            {/* Auth section */}
                            {user ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${user.role === 'host' ? 'bg-gradient-to-br from-pink-500 to-orange-400' : 'bg-gradient-to-br from-purple-500 to-blue-400'}`}>
                                            {user.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-xs font-semibold text-gray-900 leading-none">{user.name}</p>
                                            <p className="text-[10px] text-gray-400 capitalize flex items-center gap-0.5">
                                                {user.role === 'host' && <ShieldCheck size={9} className="text-pink-500" />}
                                                {user.role}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        title="Logout"
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAuth(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-bold hover:shadow-md transition-all"
                                >
                                    <LogIn size={16} />
                                    <span className="hidden sm:inline">Login</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </>
    );
};
