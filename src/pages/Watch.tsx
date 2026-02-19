import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, X, Users, ShoppingCart, Trash2, TicketPercent } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { usePolls } from '../hooks/usePolls';
import { useCoupons } from '../hooks/useCoupons';
import { useC } from '../contexts/CartContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { ChatPanel } from '../components/ChatPanel';
import { ReactionOverlay } from '../components/ReactionOverlay';
import { PollWidget } from '../components/PollWidget';
import { CouponBanner } from '../components/CouponBanner';
import { ShopPanel } from '../components/ShopPanel';
import { St } from '../types';
import { SOCKET_URL } from '../config';

export const Watch: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [streamInfo, setStreamInfo] = useState<St | null>(null);
    const [streamNotFound, setStreamNotFound] = useState(false);
    const [views, setViews] = useState(0);
    const [tab, setTab] = useState<'chat' | 'shop'>('chat');

    const { remoteStream } = useWebRTC(id || '', false);
    const { socket } = useSocket();
    const { open, tog, its, rem, tot, clr } = useC();
    const { coupon } = useCoupons(id || '');

    useEffect(() => {
        if (!id) return;
        const fetchStream = () => {
            fetch(`${SOCKET_URL}/api/streams/${id}`)
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(data => { setStreamInfo(data); setStreamNotFound(false); })
                .catch(() => setStreamNotFound(true));
        };
        fetchStream();

        const retry = setTimeout(fetchStream, 3000);
        return () => clearTimeout(retry);
    }, [id]);

    useEffect(() => {
        if (!socket) return;

        const hView = (c: number) => setViews(c);
        socket.on('viewer-count', hView);
        return () => {
            socket.off('viewer-count', hView);
        }
    }, [socket]);

    const count = its.reduce((a, i) => a + i.q, 0);

    const discountAmount = coupon ? tot * (coupon.discount / 100) : 0;
    const fTot = Math.max(0, tot - discountAmount);

    const pay = () => {
        alert("Demo payment successful!");
        clr();
        tog();
    };


    return (
        <div className="h-[calc(100vh-64px)] bg-gray-900 flex flex-col lg:flex-row overflow-hidden relative">


            {open && (
                <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="font-bold text-lg flex gap-2"><ShoppingBag /> Your Cart</h2>
                            <button onClick={tog}><X size={20} /></button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {its.length === 0 ? <p className="text-center text-gray-400">Empty</p> : its.map(i => (
                                <div key={i.id} className="flex gap-4 items-center">
                                    <img src={i.image} className="w-16 h-16 rounded object-cover" />
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-sm">{i.name}</h3>
                                        <p className="text-gray-500 text-xs">${i.price}</p>
                                    </div>
                                    <span className="text-sm">x{i.q}</span>
                                    <button onClick={() => rem(i.id)} className="text-red-400"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 border-t bg-gray-50">
                            <div className="flex justify-between text-gray-600 mb-2"><span>Subtotal</span><span>${tot.toFixed(2)}</span></div>
                            {coupon && (
                                <div className="flex justify-between text-green-600 mb-2">
                                    <span>Discount ({coupon.code} -{coupon.discount}%)</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${fTot.toFixed(2)}</span></div>
                            <button onClick={pay} className="w-full bg-black text-white py-3 rounded-xl mt-4 font-bold">Checkout</button>
                        </div>
                    </div>
                </div>
            )}


            <div className="flex-grow relative bg-black flex items-center justify-center overflow-hidden">

                {!remoteStream && (
                    <img src={streamInfo?.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" />
                )}

                {streamNotFound && !remoteStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white">
                        <h3 className="text-xl font-bold">Stream Not Found</h3>
                        <p className="text-gray-400 mt-2">This stream has ended or doesn't exist.</p>
                        <Link to="/" className="mt-4 px-6 py-2 bg-purple-600 rounded-full">Back Home</Link>
                    </div>
                )}

                <VideoPlayer stream={remoteStream} className="w-full h-full relative z-10" />

                <ReactionOverlay />
                <CouponBanner coupon={coupon} />
                <PollWidget roomId={id || ''} />


                <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start z-30 pointer-events-none">
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <Link to="/" className="p-2 bg-white/10 rounded-full text-white"><X size={20} /></Link>
                        <div>
                            <h1 className="text-white font-bold text-lg">{streamInfo?.title || 'Live Stream'}</h1>
                            <p className="text-gray-300 text-sm">{streamInfo?.hostName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">LIVE</span>
                        <span className="px-2 py-1 bg-black/60 text-white text-xs font-bold rounded flex gap-1"><Users size={12} /> {views}</span>
                        <button onClick={tog} className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded flex gap-1 relative">
                            <ShoppingBag size={14} /> Cart
                            {count > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px]">{count}</span>}
                        </button>
                    </div>
                </div>
            </div>


            <div className="hidden lg:flex w-96 bg-white border-l border-gray-200 flex-col z-20">
                <div className="p-4 border-b bg-gray-50 flex p-1">
                    <button onClick={() => setTab('chat')} className={`flex-1 py-1.5 text-sm font-bold rounded ${tab === 'chat' ? 'bg-white shadow' : 'text-gray-500'}`}>Chat</button>
                    <button onClick={() => setTab('shop')} className={`flex-1 py-1.5 text-sm font-bold rounded ${tab === 'shop' ? 'bg-white shadow' : 'text-gray-500'}`}>Shop</button>
                </div>

                {tab === 'chat' ? <ChatPanel roomId={id || ''} /> : <ShopPanel />}
            </div>
        </div>
    );
};
