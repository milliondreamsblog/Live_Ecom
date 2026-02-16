import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageCircle, ShoppingBag, X, Users, ThumbsUp, Flame, TicketPercent, Timer, BarChart2, ShoppingCart, Trash2, Plus } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { sts, prods } from '../services/mockData';
import { Msg, Pd } from '../types';
import { useC } from '../contexts/CartContext';
import { PC_CONFIG } from '../services/rtcConfig';

const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

interface FReact {
  id: number;
  type: string;
  left: number;
}

interface CoupData {
  code: string;
  expiresAt: number;
}

interface PollData {
  question: string;
  options: { text: string; votes: number }[];
  isActive: boolean;
}

export const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lks, setLks] = useState(0);
  const [showProd, setShowProd] = useState(true);
  const [tab, setTab] = useState<'chat' | 'shop'>('chat');

  const [views, setViews] = useState(0);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [txt, setTxt] = useState('');
  const [conn, setConn] = useState(false);
  const [vidConn, setVidConn] = useState(false);

  const [reacts, setReacts] = useState<FReact[]>([]);

  const [coup, setCoup] = useState<CoupData | null>(null);
  const [tLeft, setTLeft] = useState(0);

  const [currPoll, setCurrPoll] = useState<PollData | null>(null);
  const [voted, setVoted] = useState<number | null>(null);

  const { its, add, rem, tot, open, tog, clr } = useC();

  const sock = useRef<Socket | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const vid = useRef<HTMLVideoElement>(null);

  const s = sts.find(s => s.id === id) || sts[0];

  useEffect(() => {
    sock.current = io(URL, { transports: ['websocket', 'polling'] });

    sock.current.on('connect', () => {
      console.log('Connected to socket server');
      setConn(true);
      if (id) {
        sock.current?.emit('join-room', id);
        sock.current?.emit('watcher', id);
      }
    });

    sock.current.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setConn(false);
      setVidConn(false);
    });

    sock.current.on('offer', (bid: string, desc: RTCSessionDescriptionInit) => {
      const p = new RTCPeerConnection(PC_CONFIG);
      pc.current = p;

      p
        .setRemoteDescription(desc)
        .then(() => p.createAnswer())
        .then((sdp) => p.setLocalDescription(sdp))
        .then(() => {
          sock.current?.emit('answer', bid, p.localDescription);
        });

      p.ontrack = (e) => {
        if (vid.current) {
          vid.current.srcObject = e.streams[0];
          setVidConn(true);
        }
      };

      p.onicecandidate = (e) => {
        if (e.candidate) {
          sock.current?.emit('candidate', bid, e.candidate);
        }
      };
    });

    sock.current.on('candidate', (id: string, cand: RTCIceCandidate) => {
      pc.current?.addIceCandidate(new RTCIceCandidate(cand));
    });

    sock.current.on('broadcaster', () => {
      sock.current?.emit('watcher', id);
    });

    sock.current.on('viewer-count', (c: number) => {
      setViews(c);
    });

    sock.current.on('receive-message', (m: Msg) => {
      setMsgs((prev) => [...prev, m]);
    });

    sock.current.on('receive-reaction', (t: string) => {
      const rid = Date.now() + Math.random();
      const rLeft = Math.floor(Math.random() * 40) + 50;

      setReacts(prev => [...prev, { id: rid, type: t, left: rLeft }]);

      setTimeout(() => {
        setReacts(prev => prev.filter(r => r.id !== rid));
      }, 2000);
    });

    const hCoup = (nc: CoupData) => {
      setCoup(nc);
    };

    sock.current.on('new-coupon', hCoup);
    sock.current.on('current-coupon', hCoup);

    sock.current.on('new-poll', (p: PollData) => {
      setCurrPoll(p);
      setVoted(null);
    });

    sock.current.on('current-poll', (p: PollData) => {
      setCurrPoll(p);
    });

    sock.current.on('update-poll-results', (p: PollData) => {
      setCurrPoll(p);
    });

    sock.current.on('poll-ended', () => {
      setCurrPoll(null);
      setVoted(null);
    });

    return () => {
      if (pc.current) {
        pc.current.close();
      }
      sock.current?.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (!coup) return;

    const calcTime = () => {
      const diff = coup.expiresAt - Date.now();
      return Math.max(0, Math.ceil(diff / 1000));
    };

    const secs = calcTime();
    if (secs <= 0) {
      setCoup(null);
      setTLeft(0);
      return;
    }
    setTLeft(secs);

    const int = setInterval(() => {
      const s = calcTime();
      if (s <= 0) {
        setCoup(null);
        setTLeft(0);
        clearInterval(int);
      } else {
        setTLeft(s);
      }
    }, 1000);

    return () => clearInterval(int);
  }, [coup]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [msgs, tab]);

  const sendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txt.trim() || !id || !sock.current) return;

    sock.current.emit('send-message', {
      roomId: id,
      username: 'Guest ' + Math.floor(Math.random() * 1000),
      message: txt
    });

    setTxt('');
  };

  const sendReact = (t: string) => {
    if (!id || !sock.current) return;
    sock.current.emit('send-reaction', { roomId: id, type: t });
  };

  const vote = (idx: number) => {
    if (!id || !sock.current || voted !== null) return;
    setVoted(idx);
    sock.current.emit('vote-poll', { roomId: id, optionIndex: idx });
  };

  const pay = () => {
    alert("Demo payment successful!");
    clr();
    tog();
  };

  const getVotes = () => currPoll?.options.reduce((a, c) => a + c.votes, 0) || 0;

  const count = its.reduce((a, i) => a + i.q, 0);
  const disc = coup ? tot * 0.2 : 0;
  const fTot = tot - disc;

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-900 flex flex-col lg:flex-row overflow-hidden relative">

      {open && (
        <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingBag className="text-purple-600" />
                Your Cart
              </h2>
              <button onClick={tog} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {its.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <ShoppingCart size={48} className="mx-auto mb-3 opacity-20" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                its.map(i => (
                  <div key={i.id} className="flex gap-4 items-center">
                    <img src={i.image} alt={i.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-sm text-gray-900">{i.name}</h3>
                      <p className="text-gray-500 text-xs">${i.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm">x{i.q}</span>
                      <button
                        onClick={() => rem(i.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${tot.toFixed(2)}</span>
              </div>
              {coup && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span className="flex items-center gap-1"><TicketPercent size={14} /> Coupon ({coup.code})</span>
                  <span>-${disc.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${fTot.toFixed(2)}</span>
              </div>

              <button
                onClick={pay}
                disabled={its.length === 0}
                className="w-full bg-black text-white py-3 rounded-xl font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow relative bg-black flex items-center justify-center overflow-hidden">

        <div className="absolute inset-0 bg-gray-800">
          {!vidConn && (
            <img
              src={s.thumbnailUrl}
              alt="Stream Background"
              className="w-full h-full object-cover opacity-50 blur-sm"
            />
          )}

          <video
            ref={vid}
            autoPlay
            playsInline
            className={`w-full h-full object-cover relative z-10 ${vidConn ? 'opacity-100' : 'opacity-0'}`}
          />

          {!vidConn && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <p className="text-gray-400 font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm animate-pulse">
                {conn ? 'Waiting for host to go live...' : 'Connecting to server...'}
              </p>
            </div>
          )}
        </div>

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

        {coup && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in pointer-events-none">
            <div className="bg-yellow-400 text-black px-6 py-3 rounded-full shadow-lg border-2 border-yellow-200 flex items-center gap-4 pointer-events-auto">
              <div className="flex flex-col items-center leading-none">
                <span className="text-xs font-bold uppercase tracking-wider">Flash Sale</span>
                <span className="text-xl font-black">{coup.code}</span>
              </div>
              <div className="h-8 w-px bg-black/20"></div>
              <div className="flex items-center gap-1 font-mono font-bold text-lg text-red-600">
                <Timer size={20} />
                <span>00:{tLeft.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        )}

        {currPoll && (
          <div className="absolute top-20 right-6 w-64 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl z-50 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 text-sm leading-snug">{currPoll.question}</h3>
              <BarChart2 size={16} className="text-blue-500" />
            </div>

            <div className="space-y-2">
              {currPoll.options.map((opt, i) => {
                const total = getVotes();
                const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;

                if (voted !== null) {

                  return (
                    <div key={i} className="relative">
                      <div className="flex justify-between text-xs font-medium text-gray-700 mb-1 z-10 relative">
                        <span>{opt.text}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-md overflow-hidden relative">
                        <div
                          className={`h-full transition-all duration-500 ${voted === i ? 'bg-blue-500' : 'bg-gray-300'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                        {voted === i && (
                          <div className="absolute inset-0 flex items-center justify-end px-2">
                            <span className="text-xs text-white font-bold">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {

                  return (
                    <button
                      key={i}
                      onClick={() => vote(i)}
                      className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-all"
                    >
                      {opt.text}
                    </button>
                  );
                }
              })}
            </div>
            <div className="mt-2 text-right">
              <span className="text-xs text-gray-500">{getVotes()} votes</span>
            </div>
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start z-30 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <Link to="/" className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-colors">
              <X size={20} />
            </Link>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">{s.title}</h1>
              <p className="text-gray-300 text-sm">{s.hostName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded flex items-center gap-1">
              LIVE
            </span>
            <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded flex items-center gap-1">
              <Users size={12} />
              {views.toLocaleString()}
            </span>
            <button
              onClick={tog}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded flex items-center gap-1 transition-colors relative"
            >
              <ShoppingBag size={14} />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] border-2 border-gray-900">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {showProd && (
          <div className="absolute bottom-24 left-6 max-w-xs w-full bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl z-30 transform transition-all animate-slide-up">
            <div className="flex gap-3 relative">
              <button
                onClick={() => setShowProd(false)}
                className="absolute -top-2 -right-2 bg-gray-200 text-gray-500 rounded-full p-1 hover:bg-gray-300"
              >
                <X size={12} />
              </button>
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                <img src={prods[0].image} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow">
                <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-0.5">Featured</p>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{prods[0].name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-lg">${prods[0].price}</span>
                  <button
                    onClick={() => add(prods[0])}
                    className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase hover:bg-gray-800 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden lg:flex w-96 bg-white border-l border-gray-200 flex-col z-20">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex p-1 bg-gray-200 rounded-lg">
            <button
              onClick={() => setTab('chat')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${tab === 'chat' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setTab('shop')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${tab === 'shop' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Shop
            </button>
          </div>
        </div>

        {tab === 'chat' ? (
          <>
            <div ref={chatRef} className="flex-grow overflow-y-auto p-4 space-y-4">
              {msgs.length === 0 ? (
                <div className="flex items-center justify-center mt-4 opacity-50">
                  <p className="text-xs text-gray-400 italic">Welcome to the chat! Say hello.</p>
                </div>
              ) : (
                msgs.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                      {msg.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-500 mr-2">{msg.username}</span>
                      <span className="text-sm text-gray-800 break-words">{msg.message}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => sendReact('heart')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors font-medium text-sm"
                >
                  <Heart size={18} />
                </button>
                <button
                  onClick={() => sendReact('like')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                >
                  <ThumbsUp size={18} />
                </button>
                <button
                  onClick={() => sendReact('fire')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium text-sm"
                >
                  <Flame size={18} />
                </button>
              </div>
              <form className="relative" onSubmit={sendMsg}>
                <input
                  type="text"
                  value={txt}
                  onChange={(e) => setTxt(e.target.value)}
                  placeholder="Say something..."
                  className="w-full bg-gray-100 border-none rounded-full pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                />
                <button type="submit" disabled={!txt.trim()} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50">
                  <MessageCircle size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {prods.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-xl border border-gray-100 flex gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{p.name}</h3>
                    <p className="text-gray-500 text-xs">In Stock</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-gray-900">${p.price.toFixed(2)}</span>
                    <button
                      onClick={() => add(p)}
                      className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
