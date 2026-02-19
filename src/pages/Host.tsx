import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, Settings, Share2, AlertCircle, TicketPercent, BarChart2, Plus, Trash2 } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { usePolls } from '../hooks/usePolls';
import { VideoPlayer } from '../components/VideoPlayer';
import { ReactionOverlay } from '../components/ReactionOverlay';
import { PollWidget } from '../components/PollWidget';

const Host: React.FC = () => {
    const [roomId] = useState(() => crypto.randomUUID());
    const { socket, connected } = useSocket();
    const { localStream, setLocalStream } = useWebRTC(roomId, true);
    const { currentPoll, createPoll, endPoll } = usePolls(roomId);

    const [live, setLive] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState('00:00:00');

    const [stitle, setStitle] = useState('Summer Collection Launch ☀️');

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
    const [cat, setCat] = useState('Fashion');
    const [hname, setHname] = useState('Anonymous Host');
    const [views, setViews] = useState(0);

    const [ccode, setCcode] = useState('');
    const [cdur, setCdur] = useState(60);
    const [cdisc, setCdisc] = useState(20);

    const [pques, setPques] = useState('');
    const [popts, setPopts] = useState<string[]>(['', '']);

    useEffect(() => {
        if (!socket) return;

        const handleViewerCount = (c: number) => setViews(c);

        socket.emit('join-room', roomId);
        socket.on('viewer-count', handleViewerCount);

        return () => {
            socket.off('viewer-count', handleViewerCount);
        };
    }, [socket, roomId]);

    const goLive = () => {
        if (!stitle || !socket) return;
        setLive(true);
        setStartTime(Date.now());
        socket.emit('broadcaster', roomId);
        socket.emit('start-stream', { roomId, title: stitle, category: cat, hostName: hname });
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

    const addOpt = () => setPopts([...popts, '']);
    const remOpt = (idx: number) => setPopts(popts.filter((_, i) => i !== idx));
    const updOpt = (idx: number, val: string) => {
        const nw = [...popts];
        nw[idx] = val;
        setPopts(nw);
    };

    useEffect(() => {
        async function startCam() {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(s);
            } catch (e) {
                console.error("Camera error", e);
            }
        }
        startCam();
    }, [setLocalStream]);


    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 h-[calc(100vh-64px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

                    <div className="lg:col-span-2 flex flex-col h-full">
                        <div className="relative flex-grow bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                            <VideoPlayer stream={localStream} className="w-full h-full" muted={true} />

                            <ReactionOverlay />

                            <div className="absolute top-4 left-4 flex gap-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${live ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-600 text-gray-300'}`}>
                                    <div className={`w-2 h-2 rounded-full ${live ? 'bg-white' : 'bg-gray-400'}`}></div>
                                    {live ? 'LIVE' : 'OFFLINE'}
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">

                                    </div>
                                    {!live ? (
                                        <button onClick={goLive} disabled={!stitle} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold uppercase hover:shadow-lg transition-all">Go Live</button>
                                    ) : (
                                        <button onClick={endStream} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold uppercase">End Stream</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col h-full">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Settings className="text-purple-400" /> Stream Settings
                        </h2>

                        {!live ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Stream Title</label>
                                    <input type="text" value={stitle} onChange={e => setStitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white" />
                                </div>

                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-1">

                                <div className="bg-gray-900 p-3 rounded-xl border border-gray-700">
                                    <div className="flex gap-2">
                                        <input readOnly value={`${window.location.origin}/#/watch/${roomId}`} className="flex-grow bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs text-gray-300" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-900 p-4 rounded-xl text-center">
                                        <p className="text-gray-400 text-xs uppercase font-bold">Viewers</p>
                                        <p className="text-2xl font-bold">{views}</p>
                                    </div>
                                </div>


                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                    <div className="flex items-center gap-2 mb-3 text-yellow-400"><TicketPercent size={18} /><span className="font-bold text-sm uppercase">Flash Coupon</span></div>
                                    <div className="flex gap-2">
                                        <input value={ccode} onChange={e => setCcode(e.target.value.toUpperCase())} placeholder="Code" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white" />
                                        <input type="number" value={cdisc} onChange={e => setCdisc(Number(e.target.value))} placeholder="%" className="w-16 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white" />
                                        <input type="number" value={cdur} onChange={e => setCdur(parseInt(e.target.value))} className="w-20 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white" />
                                        <button onClick={sendCoup} disabled={!ccode} className="bg-yellow-500 text-black px-3 rounded font-bold uppercase">Send</button>
                                    </div>
                                </div>


                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                    <div className="flex items-center gap-2 mb-3 text-blue-400"><BarChart2 size={18} /><span className="font-bold text-sm uppercase">Live Poll</span></div>
                                    {currentPoll ? (
                                        <div className="space-y-3">
                                            <p className="text-sm font-semibold">{currentPoll.question}</p>

                                            <button onClick={endPoll} className="w-full py-2 bg-red-600 rounded text-sm font-bold uppercase">End Poll</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <input value={pques} onChange={e => setPques(e.target.value)} placeholder="Question" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white" />
                                            <div className="space-y-2">
                                                {popts.map((opt, i) => (
                                                    <div key={i} className="flex gap-2">
                                                        <input value={opt} onChange={e => updOpt(i, e.target.value)} placeholder={`Option ${i + 1}`} className="flex-grow bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white" />
                                                        {popts.length > 2 && <button onClick={() => remOpt(i)}><Trash2 size={16} className="text-gray-500" /></button>}
                                                    </div>
                                                ))}
                                            </div>
                                            {popts.length < 4 && <button onClick={addOpt} className="text-xs text-blue-400 flex items-center gap-1"><Plus size={14} /> Add Option</button>}
                                            <button onClick={startPoll} disabled={!pques} className="w-full py-2 bg-blue-600 rounded text-sm font-bold uppercase">Start Poll</button>
                                        </div>
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
