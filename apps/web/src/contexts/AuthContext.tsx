import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
    name: string;
    role: 'host' | 'viewer';
}

interface AuthCtxType {
    user: User | null;
    login: (name: string, role: 'host' | 'viewer') => void;
    logout: () => void;
}

const AuthCtx = createContext<AuthCtxType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem('liveshop_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const login = (name: string, role: 'host' | 'viewer') => {
        const u: User = { name: name.trim(), role };
        setUser(u);
        localStorage.setItem('liveshop_user', JSON.stringify(u));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('liveshop_user');
    };

    return (
        <AuthCtx.Provider value={{ user, login, logout }}>
            {children}
        </AuthCtx.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
