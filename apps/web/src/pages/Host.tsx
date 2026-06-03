import React, { useState, useEffect, useRef } from 'react';
import {
    Camera, CameraOff, Mic, MicOff, Settings, Share2, TicketPercent,
    BarChart2, Plus, Trash2, Zap, Heart, ThumbsUp, Flame, ShoppingBag, Copy, CheckCheck
} from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { usePolls } from '../hooks/usePolls';
import { useAuth } from '../contexts/AuthContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { ReactionOverlay } from '../components/ReactionOverlay';
import { PollWidget } from '../components/PollWidget';
import { ProductCard } from '../components/ProductCard';
import { prods } from '../services/mockData';
import { Product } from '../types';
import { AuthModal } from '../components/AuthModal';

interface ReactionStats {
    heart: number;
    like: number;
    fire: number;
}

const Host: React.FC = () => {
    const [roomId] = useState(() => crypto.randomUUID());
    const { socket, connected } = useSocket();
    const { localStream, setLocalStream } = useWebRTC(roomId, true);
    const { currentPoll, createPoll, endPoll } = usePolls(roomId);
    const { user } = useAuth();

    const [live, setLive] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState('00:00:00');
    const [stitle, setStitle] = useState('🎉 Dhamakedaar Live Sale!');
    const [cat, setCat] = useState('Fashion');
    const [views, setViews] = useState(0);
    const [copied, setCopied] = useState(false);

    // Cam/Mic state
    const [camOn, setCamOn] = useState(true);
    const [micOn, setMicOn] = useState(true);

    // Coupon
    const [ccode, setCcode] = useState('');
    const [cdur, setCdur] = useState(60);
    const [cdisc, setCdisc] = useState(20);

    // Poll
    const [pques, setPques] = useState('');
    const [popts, setPopts] = useState<string[]>(['', '']);

    // Reaction analytics
    const [rxStats, setRxStats] = useState<ReactionStats>({ heart: 0, like: 0, fire: 0 });

    const [showAuth, setShowAuth] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'interactive'>('overview');
    const [itemsSold, setItemsSold] = useState(0);

    // Elapsed timer
    useEffect(() => {
        let int: NodeJS.Timeout;
        if (live && startTime) {
            int = setInterval(() => {
                const diff = Math.floor((Date.now() - startTime) / 1000);
                const h = Math.floor(diff / 3600).toString().padStart(2, '0');
                const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
                const s = (diff % 60).toString().padStart(2, '0');
                setElapsed(`${h}:${m}:${s}`);
            }, 1000);
        } else {
            setElapsed('00:00:00');
        }
        return () => clearInterval(int);
    }, [live, startTime]);

    // Socket events
    useEffect(() => {
        if (!socket) return;

        const handleViewerCount = (c: number) => setViews(c);
        const handleReaction = (type: string) => {
            setRxStats(prev => {
                if (type === 'heart') return { ...prev, heart: prev.heart + 1 };
                if (type === 'like') return { ...prev, like: prev.like + 1 };
                if (type === 'fire') return { ...prev, fire: prev.fire + 1 };
                return prev;
            });
        };

        const hBuy = () => setItemsSold(prev => prev + 1);

        socket.emit('join-room', roomId);
        socket.on('viewer-count', handleViewerCount);
        socket.on('receive-reaction', handleReaction);
        socket.on('product-purchased', hBuy);

        return () => {
            socket.off('viewer-count', handleViewerCount);
            socket.off('receive-reaction', handleReaction);
            socket.off('product-purchased', hBuy);
        };
    }, [socket, roomId]);

    // Start camera on mount
    useEffect(() => {
        async function startCam() {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(s);
            } catch (e) {
                console.error('Camera error', e);
            }
        }
        startCam();
    }, [setLocalStream]);

    // Cam toggle
    const toggleCam = () => {
        if (!localStream) return;
        const track = localStream.getVideoTracks()[0];
        if (track) {
            track.enabled = !camOn;
            setCamOn(!camOn);
        }
    };

    // mic toggle
    const toggleMic = () => {
        if (!localStream) return;
        const track = localStream.getAudioTracks()[0];
        if (track) {
            track.enabled = !micOn;
            setMicOn(!micOn);
        }
    };

    const goLive = () => {
        if (!stitle || !socket) return;
        const hostName = user?.name || 'Anonymous Host';
        setLive(true);
        setStartTime(Date.now());
        socket.emit('broadcaster', roomId);
        socket.emit('start-stream', { roomId, title: stitle, category: cat, hostName });
    };

    const endStream = () => {
        if (!socket) return;
        setLive(false);
        socket.emit('end-stream', { roomId });
    };

    const sendCoup = () => {
        if (!ccode || cdur <= 0 || !socket) return;
        socket.emit('send-coupon', { roomId, code: ccode, discount: cdisc, duration: cdur });
        setCcode('');
    };

    const startPoll = () => {
        if (!pques || popts.some(o => !o.trim())) return;
        createPoll(pques, popts.filter(o => o.trim()));
        setPques('');
        setPopts(['', '']);
    };

    const featureProduct = (p: Product) => {
        if (!socket) return;
        socket.emit('feature-product', { roomId, product: p });
    };

    const copyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/#/watch/${roomId}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const addOpt = () => setPopts([...popts, '']);
    const remOpt = (idx: number) => setPopts(popts.filter((_, i) => i !== idx));
    const updOpt = (idx: number, val: string) => {
        const nw = [...popts];
        nw[idx] = val;
        setPopts(nw);
    };

    const totalRx = rxStats.heart + rxStats.like + rxStats.fire;

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center max-w-sm">
                    <div className="text-6xl mb-4">🎙️</div>
                    <h2 className="text-2xl font-bold mb-2">Login Required</h2>
                    <p className="text-gray-400 mb-6">You need to login as a Host to go live.</p>
                    <button
                        onClick={() => setShowAuth(true)}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold hover:shadow-lg transition-all"
                    >
                        Login as Host
                    </button>
                </div>
                {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
            </div>
        );
    }

    if (user.role !== 'host') {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center max-w-sm">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold mb-2">Hosts Only!</h2>
                    <p className="text-gray-400 mb-2">Your account is set as <span className="text-purple-400 font-semibold">Viewer</span>.</p>
                    <p className="text-gray-500 text-sm">To go live, please log out and log back in as a Host.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 h-[calc(100vh-64px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

                    {/* Video feed */}
                    <div className="lg:col-span-2 flex flex-col h-full">
                        <div className="relative flex-grow bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                            <VideoPlayer stream={localStream} className="w-full h-full" muted={true} />
                            <ReactionOverlay />

                            {/* Cam-off overlay */}
                            {!camOn && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-20">
                                    <div className="text-center">
                                        <CameraOff size={48} className="mx-auto text-gray-500 mb-2" />
                                        <p className="text-gray-400 text-sm">Camera is off</p>
                                    </div>
                                </div>
                            )}

                            {/* Status badge */}
                            <div className="absolute top-4 left-4 flex gap-2 z-30">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${live ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-600 text-gray-300'}`}>
                                    <div className={`w-2 h-2 rounded-full ${live ? 'bg-white' : 'bg-gray-400'}`}></div>
                                    {live ? 'LIVE' : 'OFFLINE'}
                                </div>
                                {live && (
                                    <div className="px-3 py-1 bg-black/60 text-gray-300 rounded-full text-xs font-mono">
                                        {elapsed}
                                    </div>
                                )}
                            </div>

                            {/* Mic-off badge */}
                            {!micOn && (
                                <div className="absolute top-4 right-4 z-30 px-2 py-1 bg-red-600/90 rounded-full text-xs text-white flex items-center gap-1">
                                    <MicOff size={12} /> Muted
                                </div>
                            )}

                            {/* Bottom controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent z-30">
                                <div className="flex items-center justify-between">
                                    {/* Cam/Mic toggles */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={toggleCam}
                                            title={camOn ? 'Camera Off' : 'Camera On'}
                                            className={`p-3 rounded-full font-bold transition-all ${camOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                                        >
                                            {camOn ? <Camera size={20} /> : <CameraOff size={20} />}
                                        </button>
                                        <button
                                            onClick={toggleMic}
                                            title={micOn ? 'Mute' : 'Unmute'}
                                            className={`p-3 rounded-full font-bold transition-all ${micOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                                        >
                                            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                                        </button>
                                    </div>

                                    {!live ? (
                                        <button onClick={goLive} disabled={!stitle} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold uppercase hover:shadow-lg transition-all disabled:opacity-50">
                                            🚀 Go Live
                                        </button>
                                    ) : (
                                        <button onClick={endStream} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold uppercase">
                                            End Stream
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-gray-900 rounded-3xl p-6 border border-gray-800 flex flex-col h-full overflow-hidden shadow-2xl relative">
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 flex-shrink-0 text-white relative z-10">
                            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                                <Settings className="text-purple-400" size={18} />
                            </div>
                            Stream Controls
                        </h2>

                        {!live ? (
                            <div className="space-y-6 relative z-10 flex-grow flex flex-col justify-center pb-12">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                                        <Camera size={28} className="text-pink-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Ready to Go Live?</h3>
                                    <p className="text-sm text-gray-400 mt-1">Set up your stream details below</p>
                                </div>

                                <div className="space-y-5 bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stream Title</label>
                                        <input type="text" value={stitle} onChange={e => setStitle(e.target.value)} className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" placeholder="Enter an exciting title..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                                        <select value={cat} onChange={e => setCat(e.target.value)} className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none">
                                            <option>Fashion</option>
                                            <option>Jewellery</option>
                                            <option>Beauty</option>
                                            <option>Food & Beverages</option>
                                            <option>Electronics</option>
                                            <option>Home & Kitchen</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-xl p-4 border border-gray-700/50 flex flex-col items-center">
                                    <p className="text-xs font-medium text-gray-400 mb-1">Hosting as</p>
                                    <p className="text-base font-bold text-white flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        {user.name}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col relative z-10 overflow-hidden">
                                {/* Tabs */}
                                <div className="flex p-1 bg-gray-800/80 rounded-xl mb-4 border border-gray-700">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('interactive')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'interactive' ? 'bg-purple-600 text-white shadow-sm shadow-purple-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                                    >
                                        Interactive Tools
                                    </button>
                                </div>

                                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                    {activeTab === 'overview' ? (
                                        <>
                                            {/* Share link */}
                                            <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Share2 size={14} className="text-blue-400" /> Share Link
                                                </p>
                                                <div className="flex gap-2">
                                                    <input readOnly value={`${window.location.origin}/#/watch/${roomId}`} className="flex-grow bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-300 outline-none" />
                                                    <button onClick={copyLink} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${copied ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-600/20'}`}>
                                                        {copied ? <><CheckCheck size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center">
                                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Viewers</p>
                                                    <p className="text-3xl font-black text-white">{views}</p>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center">
                                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Reactions</p>
                                                    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">{totalRx}</p>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center">
                                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Items Sold</p>
                                                    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">{itemsSold}</p>
                                                </div>
                                            </div>

                                            {/* Reaction Analytics */}
                                            <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <BarChart2 size={16} className="text-pink-400" />
                                                    <span className="font-bold text-xs uppercase tracking-wider text-gray-300">Live Reactions Breakdown</span>
                                                </div>
                                                <div className="space-y-3">
                                                    {[
                                                        { key: 'heart', label: '❤️ Love', count: rxStats.heart, from: 'from-pink-500', to: 'to-rose-500' },
                                                        { key: 'like', label: '👍 Like', count: rxStats.like, from: 'from-blue-500', to: 'to-cyan-400' },
                                                        { key: 'fire', label: '🔥 Fire', count: rxStats.fire, from: 'from-orange-500', to: 'to-yellow-400' },
                                                    ].map(({ key, label, count, from, to }) => {
                                                        const pct = totalRx > 0 ? Math.round((count / totalRx) * 100) : 0;
                                                        return (
                                                            <div key={key}>
                                                                <div className="flex justify-between text-xs mb-1.5">
                                                                    <span className="text-gray-400 font-medium">{label}</span>
                                                                    <span className="font-bold text-white">{count} <span className="text-gray-500">({pct}%)</span></span>
                                                                </div>
                                                                <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full bg-gradient-to-r ${from} ${to} rounded-full transition-all duration-700 ease-out`}
                                                                        style={{ width: `${pct}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Feature a product */}
                                            <div className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700 shadow-md">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-1.5 bg-orange-500/20 rounded-lg">
                                                        <Zap size={16} className="text-orange-400" />
                                                    </div>
                                                    <span className="font-bold text-sm text-white">Feature Product</span>
                                                </div>
                                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                    {prods.map(p => (
                                                        <ProductCard key={p.id} product={p} onFeature={featureProduct} />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Flash Coupon */}
                                            <div className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700 shadow-md">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                                                        <TicketPercent size={16} className="text-yellow-400" />
                                                    </div>
                                                    <span className="font-bold text-sm text-white">Flash Coupon</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 mb-2">
                                                    <div className="col-span-3">
                                                        <input value={ccode} onChange={e => setCcode(e.target.value.toUpperCase())} placeholder="Code (e.g. DIWALI50)" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none transition-all" />
                                                    </div>
                                                    <div className="col-span-1 relative">
                                                        <input type="number" value={cdisc} onChange={e => setCdisc(Number(e.target.value))} min={1} max={100} className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-3 pr-8 py-2.5 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none transition-all" />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">%</span>
                                                    </div>
                                                    <div className="col-span-1 relative">
                                                        <input type="number" value={cdur} onChange={e => setCdur(parseInt(e.target.value))} min={10} className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-3 pr-8 py-2.5 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none transition-all" />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">sec</span>
                                                    </div>
                                                    <button onClick={sendCoup} disabled={!ccode} className="col-span-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-yellow-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                                        Send
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Live Poll */}
                                            <div className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700 shadow-md">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                                        <BarChart2 size={16} className="text-blue-400" />
                                                    </div>
                                                    <span className="font-bold text-sm text-white">Live Poll</span>
                                                </div>
                                                {currentPoll ? (
                                                    <div className="space-y-4">
                                                        <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                                                            <p className="text-sm font-bold text-white leading-snug">{currentPoll.question}</p>
                                                            <div className="mt-2 text-xs text-blue-400 flex items-center gap-1 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Poll Active</div>
                                                        </div>
                                                        <button onClick={endPoll} className="w-full py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 rounded-xl text-sm font-bold transition-colors">End Poll Early</button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <input value={pques} onChange={e => setPques(e.target.value)} placeholder="Ask your viewers..." className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                                                        <div className="space-y-2">
                                                            {popts.map((opt, i) => (
                                                                <div key={i} className="flex gap-2 group">
                                                                    <div className="w-6 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</div>
                                                                    <input value={opt} onChange={e => updOpt(i, e.target.value)} placeholder={`Option text`} className="flex-grow bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                                                                    {popts.length > 2 && <button onClick={() => remOpt(i)} className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all bg-gray-900 rounded-xl border border-gray-700"><Trash2 size={14} /></button>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {popts.length < 4 && (
                                                            <button onClick={addOpt} className="text-xs font-bold text-blue-400 flex items-center gap-1.5 hover:text-blue-300 py-1 pl-8">
                                                                <Plus size={12} /> Add Option
                                                            </button>
                                                        )}
                                                        <button onClick={startPoll} disabled={!pques} className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                                            Launch Poll
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { Host };
