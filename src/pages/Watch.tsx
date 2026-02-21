import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Users, Trash2 } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { usePolls } from '../hooks/usePolls';
import { useCoupons } from '../hooks/useCoupons';
import { useC } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { ChatPanel } from '../components/ChatPanel';
import { ReactionOverlay } from '../components/ReactionOverlay';
import { PollWidget } from '../components/PollWidget';
import { CouponBanner } from '../components/CouponBanner';
import { ShopPanel } from '../components/ShopPanel';
import { FeaturedProductOverlay } from '../components/FeaturedProductOverlay';
import { St, FeaturedProduct } from '../types';
import { SOCKET_URL } from '../config';

export const Watch: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [streamInfo, setStreamInfo] = useState<St | null>(null);
    const [streamNotFound, setStreamNotFound] = useState(false);
    const [views, setViews] = useState(0);
    const [tab, setTab] = useState<'chat' | 'shop'>('chat');
    const [featuredProduct, setFeaturedProduct] = useState<FeaturedProduct | null>(null);

    const { remoteStream } = useWebRTC(id || '', false);
    const { socket } = useSocket();
    const { open, tog, its, rem, tot, clr } = useC();
    const { coupon } = useCoupons(id || '');
    const { user } = useAuth();

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
        const hStreamEnded = () => navigate('/');
        const hFeatured = (product: FeaturedProduct) => {
            setFeaturedProduct({ ...product, featuredAt: Date.now() });
        };

        socket.on('viewer-count', hView);
        socket.on('stream-ended', hStreamEnded);
        socket.on('featured-product', hFeatured);

        return () => {
            socket.off('viewer-count', hView);
            socket.off('stream-ended', hStreamEnded);
            socket.off('featured-product', hFeatured);
        };
    }, [socket, navigate]);

    const count = its.reduce((a, i) => a + i.q, 0);
    const disc = coupon ? tot * (coupon.discount / 100) : 0;
    const fTot = Math.max(0, tot - disc);

    const pay = () => {
        if (socket && id) {
            its.forEach(item => {
                socket.emit('product-purchased', {
                    roomId: id,
                    username: user?.name || 'Someone',
                    product: { id: item.id, name: item.name, price: item.price }
                });
            });
        }
        alert('Demo payment successful! Dhanyavaad 🙏');
        clr();
        tog();
    };

    return (
        <div className="h-screen bg-gray-900 flex flex-col lg:flex-row overflow-hidden relative">

            {/* Cart modal */}
            {open && (
                <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="font-bold text-lg flex gap-2 items-center"><ShoppingBag size={20} /> Aapka Cart 🛒</h2>
                            <button onClick={tog}><X size={20} /></button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {its.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">Cart khali hai! 😢</p>
                            ) : (
                                its.map(i => (
                                    <div key={i.id} className="flex gap-4 items-center">
                                        <img src={i.image} className="w-16 h-16 rounded-lg object-cover" alt={i.name} />
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-sm">{i.name}</h3>
                                            <p className="text-gray-500 text-xs">₹{i.price.toLocaleString('en-IN')}</p>
                                        </div>
                                        <span className="text-sm font-medium">x{i.q}</span>
                                        <button onClick={() => rem(i.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-6 border-t bg-gray-50">
                            <div className="flex justify-between text-gray-600 mb-2"><span>Subtotal</span><span>₹{tot.toLocaleString('en-IN')}</span></div>
                            {coupon && (
                                <div className="flex justify-between text-green-600 mb-2">
                                    <span>Discount ({coupon.code} -{coupon.discount}%)</span>
                                    <span>-₹{disc.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{fTot.toLocaleString('en-IN')}</span></div>
                            <button onClick={pay} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl mt-4 font-bold hover:shadow-lg transition-all">
                                Pay Now 🚀
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video area */}
            <div className="flex-grow relative bg-black flex items-center justify-center overflow-hidden">
                {!remoteStream && (
                    <img src={streamInfo?.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" alt="" />
                )}
                {streamNotFound && !remoteStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white">
                        <h3 className="text-xl font-bold">Stream Not Found</h3>
                        <p className="text-gray-400 mt-2">This stream has ended or doesn't exist.</p>
                        <Link to="/" className="mt-4 px-6 py-2 bg-purple-600 rounded-full font-bold">Back Home</Link>
                    </div>
                )}

                <VideoPlayer stream={remoteStream} className="w-full h-full relative z-10" />
                <ReactionOverlay />
                <CouponBanner coupon={coupon} />
                <PollWidget roomId={id || ''} />

                {/* Featured product overlay */}
                <FeaturedProductOverlay
                    product={featuredProduct}
                    onDismiss={() => setFeaturedProduct(null)}
                />

                {/* Top HUD */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start z-30 pointer-events-none">
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <Link to="/" className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={20} /></Link>
                        <div>
                            <h1 className="text-white font-bold text-base leading-tight">{streamInfo?.title || 'Live Stream'}</h1>
                            <p className="text-gray-300 text-sm">{streamInfo?.hostName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded animate-pulse">LIVE</span>
                        <span className="px-2 py-1 bg-black/60 text-white text-xs font-bold rounded flex gap-1 items-center"><Users size={12} /> {views}</span>
                        <button onClick={tog} className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded flex gap-1 items-center relative hover:bg-purple-700 transition-colors">
                            <ShoppingBag size={14} /> Cart
                            {count > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                                    {count}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right sidebar */}
            <div className="hidden lg:flex w-96 bg-white border-l border-gray-200 flex-col z-20">
                <div className="p-3 border-b bg-gray-50 flex gap-1">
                    <button onClick={() => setTab('chat')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'chat' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>💬 Chat</button>
                    <button onClick={() => setTab('shop')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'shop' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>🛍️ Shop</button>
                </div>
                {tab === 'chat' ? <ChatPanel roomId={id || ''} /> : <ShopPanel />}
            </div>
        </div>
    );
};
