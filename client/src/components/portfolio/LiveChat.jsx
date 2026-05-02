import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:3001';

export default function LiveChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [roomId, setRoomId] = useState('');
    const [notifStatus, setNotifStatus] = useState('idle');

    const bottomRef = useRef(null);
    // Evite d'envoyer plusieurs notifications Telegram pour la meme conversation.
    const hasNotifiedRef = useRef(false);

    // ─────────────────────────────
    // SOCKET INIT
    // ─────────────────────────────
    // Cree la connexion Socket.IO quand le visiteur ouvre le chat.
    useEffect(() => {
        if (!open) return;

        const generatedRoomId =
            crypto?.randomUUID?.() ||
            `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        setRoomId(generatedRoomId);

        const s = io(SERVER_URL, {
            transports: ['websocket']
        });

        setSocket(s);

        s.on('connect', () => {
            setConnected(true);
            s.emit('join-room', {
                roomId: generatedRoomId,
                role: 'visitor'
            });
        });

        s.on('disconnect', () => {
            setConnected(false);
        });

        s.on('history', (history) => {
            setMessages(history || []);
        });

        s.on('message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            s.disconnect();
        };
    }, [open]);

    // ─────────────────────────────
    // AUTO SCROLL
    // ─────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ─────────────────────────────
    // SEND MESSAGE + NOTIFY ADMIN
    // ─────────────────────────────
    // Envoie le message au serveur et cree la notification admin au premier envoi.
    const sendMessage = async () => {
        if (!input.trim() || !socket || !connected || !roomId) return;

        const text = input.trim();

        // 🔔 notify admin ONLY ON FIRST MESSAGE
        if (!hasNotifiedRef.current) {
            hasNotifiedRef.current = true;
            setNotifStatus('sending');

            // Demande au backend de creer une salle et d'envoyer la notification Telegram.
            try {
                const res = await fetch(`${SERVER_URL}/api/live-chat/notify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roomId,
                        pageUrl: window.location.href,
                        visitorName: 'Visiteur portfolio',
                    }),
                });

                const data = await res.json();

                if (data?.ok) {
                    setNotifStatus('sent');
                } else {
                    setNotifStatus('failed');
                }
            } catch (e) {
                setNotifStatus('failed');
            }
        }

        // Envoie le texte a la salle Socket.IO du visiteur.
        socket.emit('message', {
            roomId,
            text,
            sender: 'visitor'
        });

        setInput('');
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // ─────────────────────────────
    // UI
    // ─────────────────────────────
    return (
        <div className="fixed bottom-6 right-24 z-50 flex flex-col items-end gap-3">

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-80 bg-card border rounded-2xl shadow-xl overflow-hidden"
                    >

                        {/* HEADER */}
                        <div className="bg-primary px-4 py-3 flex justify-between">
                            <div>
                                <p className="text-white font-semibold text-sm">
                                    Chat en direct
                                </p>

                                <p className="text-white/70 text-xs">
                                    {connected ? 'Connecté' : 'Connexion...'}
                                </p>

                                <p className="text-white/60 text-[11px] mt-1">
                                    {notifStatus === 'sending' && 'Notification envoyée...'}
                                    {notifStatus === 'sent' && 'Admin notifié'}
                                    {notifStatus === 'failed' && 'Erreur notification'}
                                </p>
                            </div>

                            <button onClick={() => setOpen(false)}>
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* MESSAGES */}
                        <div className="h-72 overflow-y-auto p-4 space-y-2 bg-background">

                            {messages.length === 0 && (
                                <p className="text-center text-xs text-muted-foreground mt-8">
                                    Bonjour 👋
                                </p>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`px-3 py-2 rounded-xl text-sm max-w-[75%] ${
                                        msg.sender === 'visitor'
                                            ? 'bg-primary text-white'
                                            : 'bg-secondary'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            <div ref={bottomRef} />
                        </div>

                        {/* INPUT */}
                        <div className="border-t p-3 flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Votre message..."
                                className="flex-1 px-3 py-2 rounded-xl bg-secondary text-sm"
                            />

                            <button
                                onClick={sendMessage}
                                className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* BUTTON */}
            <motion.button
                onClick={() => setOpen(v => !v)}
                className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center"
            >
                {open ? <X /> : <MessageCircle />}
            </motion.button>

        </div>
    );
}