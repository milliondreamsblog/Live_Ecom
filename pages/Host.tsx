import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, Settings, Share2, AlertCircle, TicketPercent, BarChart2, Plus, Trash2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { PC_CONFIG } from '../services/rtcConfig';

const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const RID = '1';

interface FReact {
  id: number;
  type: string;
  left: number;
}

interface POpt {
  text: string;
  votes: number;
}

interface PollData {
  question: string;
  options: POpt[];
  isActive: boolean;
}

export const Host: React.FC = () => {
  const [live, setLive] = useState(false);
  const [stitle, setStitle] = useState('Summer Collection Launch ☀️');
  const [cat, setCat] = useState('Fashion');
  const [views, setViews] = useState(0);
  const [permErr, setPermErr] = useState(false);

  const [ccode, setCcode] = useState('');
  const [cdur, setCdur] = useState(60);

  const [pques, setPques] = useState('');
  const [popts, setPopts] = useState<string[]>(['', '']);
  const [currPoll, setCurrPoll] = useState<PollData | null>(null);

  const [reacts, setReacts] = useState<FReact[]>([]);

  const vidRef = useRef<HTMLVideoElement>(null);
  const sock = useRef<Socket | null>(null);
  const sref = useRef<MediaStream | null>(null);
  const pcs = useRef<{ [key: string]: RTCPeerConnection }>({});

  const initCam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      sref.current = s;
      if (vidRef.current) {
        vidRef.current.srcObject = s;
      }
      setPermErr(false);
    } catch (e) {
      console.error("Error accessing media devices:", e);
      setPermErr(true);
    }
  };

  useEffect(() => {
    initCam();

    sock.current = io(URL, { transports: ['websocket', 'polling'] });

    sock.current.on('connect', () => {
      console.log("Host connected to socket");
      sock.current?.emit('join-room', RID);
    });

    sock.current.on('viewer-count', (c: number) => {
      setViews(c);
    });

    sock.current.on('watcher', (id: string) => {
      const pc = new RTCPeerConnection(PC_CONFIG);
      pcs.current[id] = pc;

      if (sref.current) {
        sref.current.getTracks().forEach(t => {
          if (sref.current) {
            pc.addTrack(t, sref.current);
          }
        });
      }

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sock.current?.emit('candidate', id, e.candidate);
        }
      };

      pc
        .createOffer()
        .then(sdp => pc.setLocalDescription(sdp))
        .then(() => {
          sock.current?.emit('offer', id, pc.localDescription);
        });
    });

    sock.current.on('answer', (id: string, desc: RTCSessionDescriptionInit) => {
      pcs.current[id]?.setRemoteDescription(desc);
    });

    sock.current.on('candidate', (id: string, cand: RTCIceCandidate) => {
      pcs.current[id]?.addIceCandidate(new RTCIceCandidate(cand));
    });

    sock.current.on('disconnectPeer', (id: string) => {
      if (pcs.current[id]) {
        pcs.current[id].close();
        delete pcs.current[id];
      }
    });

    sock.current.on('receive-reaction', (t: string) => {
      const rid = Date.now() + Math.random();
      const rLeft = Math.floor(Math.random() * 40) + 50;

      setReacts(prev => [...prev, { id: rid, type: t, left: rLeft }]);

      setTimeout(() => {
        setReacts(prev => prev.filter(r => r.id !== rid));
      }, 2000);
    });

    sock.current.on('update-poll-results', (p: PollData) => {
      setCurrPoll(p);
    });

    return () => {
      if (sref.current) {
        sref.current.getTracks().forEach(t => t.stop());
      }
      sock.current?.disconnect();
    };
  }, []);

  const goLive = () => {
    if (!stitle) return;
    setLive(true);
    sock.current?.emit('broadcaster', RID);
    sock.current?.emit('start-stream', { title: stitle, id: RID });
  };

  const endStream = () => {
    setLive(false);
    Object.values(pcs.current).forEach(p => p.close());
    pcs.current = {};
  };

  const sendCoup = () => {
    if (!ccode || cdur <= 0) return;

    sock.current?.emit('send-coupon', {
      roomId: RID,
      code: ccode,
      duration: cdur
    });
    setCcode('');
  };

  const addOpt = () => setPopts([...popts, '']);

  const remOpt = (idx: number) => {
    if (popts.length > 2) {
      setPopts(popts.filter((_, i) => i !== idx));
    }
  };

  const updOpt = (idx: number, val: string) => {
    const nw = [...popts];
    nw[idx] = val;
    setPopts(nw);
  };

  const startPoll = () => {
    if (!pques || popts.some(o => !o.trim())) return;

    const np = {
      question: pques,
      options: popts.map(t => ({ text: t, votes: 0 })),
      isActive: true
    };

    setCurrPoll(np);
    sock.current?.emit('create-poll', {
      roomId: RID,
      question: pques,
      options: popts
    });
  };

  const endPoll = () => {
    sock.current?.emit('end-poll', { roomId: RID });
    setCurrPoll(null);
    setPques('');
    setPopts(['', '']);
  };

  const getVotes = () => currPoll?.options.reduce((a, c) => a + c.votes, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 h-[calc(100vh-64px)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="relative flex-grow bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <video
                ref={vidRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {permErr && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-50">
                  <div className="text-center p-6 max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Camera Access Required</h3>
                    <p className="text-gray-400 mb-6">
                      Please allow access to your camera and microphone to start streaming.
                    </p>
                    <button
                      onClick={initCam}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold transition-colors"
                    >
                      Enable Camera
                    </button>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                {reacts.map(r => (
                  <div
                    key={r.id}
                    className="absolute bottom-20 text-4xl animate-float"
                    style={{ left: `${r.left}%` }}
                  >
                    {r.type === 'heart' && '❤️'}
                    {r.type === 'like' && '👍'}
                    {r.type === 'fire' && '🔥'}
                  </div>
                ))}
              </div>

              <div className="absolute top-4 left-4 flex gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${live ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-600 text-gray-300'}`}>
                  <div className={`w-2 h-2 rounded-full ${live ? 'bg-white' : 'bg-gray-400'}`}></div>
                  {live ? 'LIVE' : 'OFFLINE'}
                </div>
                {live && (
                  <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium">
                    00:12:45
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-full transition-colors">
                      <Mic size={20} />
                    </button>
                    <button className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-full transition-colors">
                      <Camera size={20} />
                    </button>
                    <button className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-full transition-colors">
                      <Settings size={20} />
                    </button>
                  </div>
                  {!live ? (
                    <button
                      onClick={goLive}
                      disabled={!stitle}
                      className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all transform hover:scale-105 ${stitle ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-600/25' : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                    >
                      Go Live
                    </button>
                  ) : (
                    <button
                      onClick={endStream}
                      className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-red-600/25"
                    >
                      End Stream
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings className="text-purple-400" />
              Stream Settings
            </h2>

            {!live ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Stream Title</label>
                  <input
                    type="text"
                    value={stitle}
                    onChange={(e) => setStitle(e.target.value)}
                    placeholder="E.g., Summer Sale Extravaganza!"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                  <select
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option>Fashion</option>
                    <option>Technology</option>
                    <option>Gaming</option>
                    <option>Lifestyle</option>
                    <option>Food</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Viewers</p>
                    <p className="text-2xl font-bold text-white">{views}</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Reactions</p>
                    <p className="text-2xl font-bold text-pink-500">{reacts.length > 0 ? '🔥' : '-'}</p>
                  </div>
                </div>

                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-2 mb-3 text-yellow-400">
                    <TicketPercent size={18} />
                    <span className="font-bold text-sm uppercase tracking-wide">Flash Coupon</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Code (e.g. FLASH50)"
                        value={ccode}
                        onChange={(e) => setCcode(e.target.value.toUpperCase())}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Secs"
                        value={cdur}
                        onChange={(e) => setCdur(parseInt(e.target.value) || 0)}
                        className="w-20 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                      <button
                        onClick={sendCoup}
                        disabled={!ccode}
                        className={`flex-grow py-2 rounded text-sm font-bold uppercase transition-colors ${ccode ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-2 mb-3 text-blue-400">
                    <BarChart2 size={18} />
                    <span className="font-bold text-sm uppercase tracking-wide">Live Poll</span>
                  </div>

                  {currPoll ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold">{currPoll.question}</p>
                      <div className="space-y-2">
                        {currPoll.options.map((opt, i) => {
                          const total = getVotes();
                          const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-400">
                                <span>{opt.text}</span>
                                <span>{pct}% ({opt.votes})</span>
                              </div>
                              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={endPoll}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-bold uppercase mt-2"
                      >
                        End Poll
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Ask a question..."
                        value={pques}
                        onChange={(e) => setPques(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="space-y-2">
                        {popts.map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`Option ${i + 1}`}
                              value={opt}
                              onChange={(e) => updOpt(i, e.target.value)}
                              className="flex-grow bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {popts.length > 2 && (
                              <button onClick={() => remOpt(i)} className="text-gray-500 hover:text-red-500">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {popts.length < 4 && (
                        <button onClick={addOpt} className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
                          <Plus size={14} /> Add Option
                        </button>
                      )}
                      <button
                        onClick={startPoll}
                        disabled={!pques || popts.some(o => !o)}
                        className={`w-full py-2 rounded text-sm font-bold uppercase transition-colors ${!pques || popts.some(o => !o) ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                      >
                        Start Poll
                      </button>
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
