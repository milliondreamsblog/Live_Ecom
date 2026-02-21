import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Host } from './pages/Host';
import { Watch } from './pages/Watch';
import { CProv } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';

const Lout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const loc = useLocation();
    const wp = loc.pathname.startsWith('/watch/');

    return (
        <>
            {!wp && <Navbar />}
            {children}
        </>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <CProv>
                    <HashRouter>
                        <Lout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/host" element={<Host />} />
                                <Route path="/watch/:id" element={<Watch />} />
                            </Routes>
                        </Lout>
                    </HashRouter>
                </CProv>
            </SocketProvider>
        </AuthProvider>
    );
}
