import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, MessageCircle, Wifi, WifiOff, Trash2, ArrowLeft, Clock, Globe, Hash } from 'lucide-react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:3001';

function Avatar({ name, size = 'md' }) {
    const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'V';
    const colors = [
        'from-violet-500 to-purple-600',
        'from-sky-400 to-blue-500',
        'from-emerald-400 to-teal-500',
        'from-rose-400 to-pink-500',
        'from-sky-400 to-blue-500',
    ];
    const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
    const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
            {initials}
        </div>
    );
}

function StatusDot({ active }) {
    return (
        <span className="relative flex h-2.5 w-2.5">
            {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
        </span>
    );
}

export default function Admin() {
    const [rooms, setRooms]           = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages]     = useState([]);
    const [input, setInput]           = useState('');
    const [connected, setConnected]   = useState(false);
    const [typing, setTyping]         = useState(false);
    const bottomRef     = useRef(null);
    const typingTimeout = useRef(null);
    const socketRef     = useRef(null);
    const inputRef      = useRef(null);

    // ── Socket init ──────────────────────────────────────────────
    useEffect(() => {
        const s = io(SERVER_URL, { transports: ['websocket'] });
        socketRef.current = s;

        s.on('connect',       () => setConnected(true));
        s.on('disconnect',    () => setConnected(false));
        // Met a jour la liste des salles quand un visiteur ouvre un chat.
        s.on('rooms-updated', (updatedRooms) => setRooms(updatedRooms));
        // Charge l'historique de la salle quand l'admin la rejoint.
        s.on('history',       (h)   => setMessages(h || []));
        // Ajoute chaque nouveau message recu en temps reel.
        s.on('message',       (msg) => setMessages(prev => [...prev, msg]));
        s.on('typing',        (data) => {
            if (data.sender === 'visitor') {
                setTyping(true);
                clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => setTyping(false), 2000);
            }
        });

        fetch(`${SERVER_URL}/api/live-chat/rooms`)
            .then(r => r.json())
            .then(data => setRooms(data.rooms || []))
            .catch(() => {});

        return () => s.disconnect();
    }, []);

    // L'admin rejoint la salle du visiteur pour repondre aux messages.
    const joinRoom = (room) => {
        if (!socketRef.current) return;
        setActiveRoom(room);
        setMessages([]);
        socketRef.current.emit('join-room', { roomId: room.roomId, role: 'admin' });
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const leaveRoom = () => { setActiveRoom(null); setMessages([]); };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Envoie la reponse de l'admin dans la salle active.
    const sendMessage = () => {
        if (!input.trim() || !socketRef.current || !connected || !activeRoom) return;
        socketRef.current.emit('message', { roomId: activeRoom.roomId, text: input.trim(), sender: 'admin' });
        setInput('');
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    // Calcule les compteurs affiches dans le panneau admin.
    const visitorMsgs = messages.filter(m => m.sender === 'visitor').length;
    const adminMsgs   = messages.filter(m => m.sender === 'admin').length;
    const formatTime  = (iso) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col font-inter text-zinc-100">

            {/* ── Top bar ── */}
            <header className="h-14 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm flex items-center px-5 gap-4 flex-shrink-0 z-10">
                {activeRoom && (
                    <button
                        onClick={leaveRoom}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}

                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-semibold text-zinc-100 truncate leading-tight">
                            {activeRoom ? activeRoom.visitorName : 'Chat Admin'}
                        </h1>
                        {activeRoom && (
                            <p className="text-[11px] text-zinc-500 truncate leading-tight">{activeRoom.pageUrl}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs">
                        <StatusDot active={connected} />
                        <span className={connected ? 'text-emerald-400' : 'text-zinc-500'}>
                            {connected ? 'Connecté' : 'Hors ligne'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Users className="w-3.5 h-3.5" />
                        <span>{rooms.length} room{rooms.length > 1 ? 's' : ''}</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* ── Sidebar ── */}
                <aside className="w-72 border-r border-white/[0.06] bg-zinc-900/40 flex-col flex-shrink-0 hidden md:flex">
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                            {activeRoom ? 'Session en cours' : 'Rooms actives'}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {activeRoom ? (
                            <>
                                {[
                                    { label: 'Total',    value: messages.length, icon: MessageCircle, accent: 'text-zinc-300',   bg: 'bg-white/[0.06]'   },
                                    { label: 'Visiteur', value: visitorMsgs,     icon: Users,         accent: 'text-sky-400',    bg: 'bg-sky-500/10'    },
                                    { label: 'Vous',     value: adminMsgs,       icon: Send,          accent: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                ].map(({ label, value, icon: Icon, accent, bg }) => (
                                    <div key={label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5 flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-3.5 h-3.5 ${accent}`} />
                                        </div>
                                        <div>
                                            <p className={`text-xl font-bold leading-none ${accent}`}>{value}</p>
                                            <p className="text-[11px] text-zinc-500 mt-0.5">{label}</p>
                                        </div>
                                    </div>
                                ))}

                                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5 space-y-2.5 mt-1">
                                    <p className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">Infos</p>
                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        <Hash className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                                        <span className="font-mono text-[11px] truncate">{activeRoom.roomId.slice(0, 16)}…</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        <Clock className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                                        <span>{formatTime(activeRoom.createdAt)}</span>
                                    </div>
                                    {activeRoom.pageUrl && (
                                        <div className="flex items-start gap-2 text-xs text-zinc-400">
                                            <Globe className="w-3 h-3 text-zinc-600 flex-shrink-0 mt-0.5" />
                                            <span className="break-all leading-relaxed">{activeRoom.pageUrl.replace(/^https?:\/\//, '')}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setMessages([])}
                                    className="w-full flex items-center gap-2 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-3.5 py-2.5 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Effacer l'affichage
                                </button>
                            </>
                        ) : (
                            rooms.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-2.5">
                                    <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center">
                                        <Users className="w-4 h-4 text-zinc-700" />
                                    </div>
                                    <p className="text-xs text-zinc-600 text-center leading-relaxed">
                                        En attente<br />de visiteurs…
                                    </p>
                                </div>
                            ) : (
                                rooms.map(room => (
                                    <motion.button
                                        key={room.roomId}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => joinRoom(room)}
                                        className="w-full rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-sky-500/25 p-3.5 text-left transition-all"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <Avatar name={room.visitorName} size="sm" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-zinc-200 truncate">{room.visitorName}</p>
                                                <p className="text-[11px] text-zinc-500">{formatTime(room.createdAt)}</p>
                                            </div>
                                            <StatusDot active />
                                        </div>
                                        {room.pageUrl && (
                                            <p className="text-[11px] text-zinc-600 truncate flex items-center gap-1.5">
                                                <Globe className="w-3 h-3 flex-shrink-0" />
                                                {room.pageUrl.replace(/^https?:\/\//, '')}
                                            </p>
                                        )}
                                    </motion.button>
                                ))
                            )
                        )}
                    </div>
                </aside>

                {/* ── Main ── */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {!activeRoom ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8">
                            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/15 flex items-center justify-center">
                                <MessageCircle className="w-7 h-7 text-sky-400/50" />
                            </div>
                            <div className="text-center space-y-1.5">
                                <p className="text-sm font-medium text-zinc-400">
                                    {rooms.length === 0 ? 'En attente de visiteurs' : 'Sélectionnez une conversation'}
                                </p>
                                <p className="text-xs text-zinc-600">
                                    {rooms.length === 0
                                        ? 'Les rooms apparaîtront automatiquement'
                                        : `${rooms.length} room${rooms.length > 1 ? 's' : ''} active${rooms.length > 1 ? 's' : ''} dans la sidebar`}
                                </p>
                            </div>
                            {/* Mobile rooms */}
                            <div className="flex flex-col gap-2 w-full max-w-sm md:hidden">
                                {rooms.map(room => (
                                    <button
                                        key={room.roomId}
                                        onClick={() => joinRoom(room)}
                                        className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-4 text-left hover:border-sky-500/30 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar name={room.visitorName} size="sm" />
                                            <div>
                                                <p className="text-sm font-medium text-zinc-200">{room.visitorName}</p>
                                                <p className="text-xs text-zinc-500">{room.pageUrl}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-1">
                                {/* Session divider */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex-1 h-px bg-white/[0.05]" />
                                    <span className="text-[11px] text-zinc-600 flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        Session démarrée à {formatTime(activeRoom.createdAt)}
                                    </span>
                                    <div className="flex-1 h-px bg-white/[0.05]" />
                                </div>

                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-700">
                                        <MessageCircle className="w-10 h-10 opacity-30" />
                                        <p className="text-sm">Aucun message pour le moment</p>
                                    </div>
                                )}

                                {messages.map((msg, i) => {
                                    const isAdmin  = msg.sender === 'admin';
                                    const prevSame = i > 0 && messages[i - 1].sender === msg.sender;
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'} ${prevSame ? 'mt-1' : 'mt-5'}`}
                                        >
                                            <div className={`flex-shrink-0 ${prevSame ? 'invisible' : ''}`}>
                                                {isAdmin
                                                    ? <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                                                        <span className="text-[11px] font-bold text-sky-400">A</span>
                                                    </div>
                                                    : <Avatar name={activeRoom.visitorName} size="sm" />
                                                }
                                            </div>
                                            <div className={`flex flex-col gap-1 max-w-[65%] ${isAdmin ? 'items-end' : 'items-start'}`}>
                                                {!prevSame && (
                                                    <span className="text-[11px] text-zinc-600 px-1">
                                                        {isAdmin ? 'Vous' : activeRoom.visitorName} · {formatTime(msg.time)}
                                                    </span>
                                                )}
                                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                    isAdmin
                                                        ? 'bg-sky-500 text-zinc-950 font-medium rounded-tr-sm'
                                                        : 'bg-white/[0.07] text-zinc-200 border border-white/[0.08] rounded-tl-sm'
                                                }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                <AnimatePresence>
                                    {typing && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-3 mt-5"
                                        >
                                            <Avatar name={activeRoom.visitorName} size="sm" />
                                            <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                                                {[0, 1, 2].map(i => (
                                                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div ref={bottomRef} />
                            </div>

                            {/* Input bar */}
                            <div className="border-t border-white/[0.06] bg-zinc-900/60 backdrop-blur-sm p-4">
                                {!connected && (
                                    <p className="text-xs text-red-400/80 text-center mb-3">
                                        ⚠️ Serveur non connecté — lancez <code className="bg-white/[0.06] px-1.5 py-0.5 rounded-md font-mono">npm run dev</code>
                                    </p>
                                )}
                                <div className="flex items-center gap-3">
                                    <input
                                        ref={inputRef}
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKey}
                                        placeholder="Répondre au visiteur…"
                                        disabled={!connected}
                                        className="flex-1 bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.14] focus:border-sky-500/40 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none disabled:opacity-40 transition-all"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!input.trim() || !connected}
                                        className="h-[46px] px-5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-zinc-950 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span className="hidden sm:inline">Envoyer</span>
                                    </button>
                                </div>
                                <p className="text-[11px] text-zinc-700 mt-2 text-center">
                                    ↵ Entrée pour envoyer
                                </p>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
