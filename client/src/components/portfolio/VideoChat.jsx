import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import {
    Copy,
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    Video,
    VideoOff,
    X,
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:3001';
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export default function VideoChat() {
    const [open, setOpen] = useState(false);
    const [connected, setConnected] = useState(false);
    const [mediaStarted, setMediaStarted] = useState(false);
    const [roomId, setRoomId] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [userName, setUserName] = useState('Visiteur portfolio');
    const [participants, setParticipants] = useState([]);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [status, setStatus] = useState('Prêt pour un appel vidéo');
    const [error, setError] = useState('');

    const socketRef = useRef(null);
    const localStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const peerConnectionsRef = useRef(new Map());
    const remoteStreamsRef = useRef(new Map());

    const refreshRemoteStreams = useCallback(() => {
        setRemoteStreams([...remoteStreamsRef.current.entries()].map(([id, stream]) => ({ id, stream })));
    }, []);

    // Ferme les connexions, arrete la camera et vide l'etat de l'appel.
    const cleanupCall = useCallback((notifyServer = true) => {
        if (notifyServer) {
            socketRef.current?.emit('video:leave-room');
        }

        peerConnectionsRef.current.forEach((pc) => pc.close());
        peerConnectionsRef.current.clear();
        remoteStreamsRef.current.clear();
        refreshRemoteStreams();

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }

        setMediaStarted(false);
        setRoomId('');
        setParticipants([]);
        setAudioEnabled(true);
        setVideoEnabled(true);
        setStatus('Prêt pour un appel vidéo');
    }, [refreshRemoteStreams]);

    useEffect(() => {
        if (!open) {
            cleanupCall();
            socketRef.current?.disconnect();
            socketRef.current = null;
            setConnected(false);
            return;
        }

        const socket = io(SERVER_URL, {
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            setStatus('Connecté au serveur vidéo');
        });

        socket.on('disconnect', () => {
            setConnected(false);
            setStatus('Serveur vidéo déconnecté');
        });

        // Quand on rejoint une salle, on cree une offre pour chaque participant deja present.
        socket.on('video:room-participants', async (existingParticipants) => {
            setParticipants(existingParticipants || []);
            await Promise.all((existingParticipants || []).map((participant) => createOffer(participant.id)));
        });

        socket.on('video:participants-updated', (updatedParticipants) => {
            setParticipants((updatedParticipants || []).filter((participant) => participant.id !== socket.id));
        });

        socket.on('video:user-joined', (participant) => {
            setParticipants((prev) => {
                if (prev.some((item) => item.id === participant.id)) return prev;
                return [...prev, participant];
            });
            setStatus(`${participant.name} a rejoint la salle`);
        });

        // Quand une offre arrive, on cree une reponse pour accepter la connexion.
        socket.on('video:offer', async ({ fromUserId, fromUserName, offer }) => {
            const pc = getPeerConnection(fromUserId, fromUserName);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('video:answer', { targetUserId: fromUserId, answer: pc.localDescription });
        });

        socket.on('video:answer', async ({ fromUserId, answer }) => {
            const pc = peerConnectionsRef.current.get(fromUserId);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on('video:ice-candidate', async ({ fromUserId, candidate }) => {
            const pc = peerConnectionsRef.current.get(fromUserId);
            if (pc && candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socket.on('video:user-left', ({ id }) => {
            peerConnectionsRef.current.get(id)?.close();
            peerConnectionsRef.current.delete(id);
            remoteStreamsRef.current.delete(id);
            refreshRemoteStreams();
        });

        return () => {
            cleanupCall();
            socket.disconnect();
        };
    }, [cleanupCall, open, refreshRemoteStreams]);

    useEffect(() => {
        if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }
    }, [mediaStarted]);

    // Cree une connexion WebRTC avec un autre participant.
    const getPeerConnection = (participantId, participantName = 'Invité') => {
        const current = peerConnectionsRef.current.get(participantId);
        if (current) return current;

        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Envoie le candidat ICE au serveur pour le transmettre a l'autre participant.
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit('video:ice-candidate', {
                    targetUserId: participantId,
                    candidate: event.candidate,
                });
            }
        };

        // Recoit le flux video distant et l'affiche dans l'interface.
        pc.ontrack = (event) => {
            if (!event.streams[0]) return;
            remoteStreamsRef.current.set(participantId, event.streams[0]);
            setParticipants((prev) => {
                if (prev.some((item) => item.id === participantId)) return prev;
                return [...prev, { id: participantId, name: participantName }];
            });
            refreshRemoteStreams();
        };

        localStreamRef.current?.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current);
        });

        peerConnectionsRef.current.set(participantId, pc);
        return pc;
    };

    // Cree une offre WebRTC et l'envoie au participant cible.
    const createOffer = async (participantId) => {
        const pc = getPeerConnection(participantId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('video:offer', { targetUserId: participantId, offer: pc.localDescription });
    };

    // Demande l'acces a la camera et au micro du navigateur.
    const startMedia = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setMediaStarted(true);
        setAudioEnabled(true);
        setVideoEnabled(true);
        setError('');
    };

    // Cree une salle sur le serveur puis rejoint cette salle avec la camera active.
    const createRoom = async () => {
        try {
            if (!socketRef.current?.connected) return;
            await startMedia();
            const response = await fetch(`${SERVER_URL}/api/video/rooms`, { method: 'POST' });
            const data = await response.json();
            setRoomId(data.roomId);
            setJoinRoomId(data.roomId);
            socketRef.current.emit('video:join-room', { roomId: data.roomId, userName });
            setStatus('Salle vidéo créée. Partagez le code pour inviter quelqu’un.');
        } catch (err) {
            setError("Impossible d'accéder à la caméra ou au micro. Vérifiez les permissions du navigateur.");
        }
    };

    // Verifie que la salle existe avant de demander l'acces camera et micro.
    const joinRoom = async (event) => {
        event.preventDefault();
        const targetRoom = joinRoomId.trim();
        if (!targetRoom || !socketRef.current?.connected) return;

        try {
            const response = await fetch(`${SERVER_URL}/api/video/rooms/${targetRoom}`);
            const data = await response.json();
            if (!data.exists) {
                setError("Cette salle vidéo n'existe pas encore.");
                return;
            }

            await startMedia();
            setRoomId(targetRoom);
            socketRef.current.emit('video:join-room', { roomId: targetRoom, userName });
            setStatus('Connexion à la salle vidéo...');
        } catch (err) {
            setError("Impossible de rejoindre la salle vidéo.");
        }
    };

    // Active ou coupe seulement la piste audio locale.
    const toggleAudio = () => {
        const audioTrack = localStreamRef.current?.getAudioTracks()[0];
        if (!audioTrack) return;
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
    };

    // Active ou coupe seulement la piste video locale.
    const toggleVideo = () => {
        const videoTrack = localStreamRef.current?.getVideoTracks()[0];
        if (!videoTrack) return;
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
    };

    // Copie le code de salle pour le partager avec une autre personne.
    const copyRoomId = async () => {
        if (!roomId) return;
        await navigator.clipboard?.writeText(roomId);
        setStatus('Code de salle copié');
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 font-inter">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.96 }}
                        className="mb-4 w-[min(92vw,760px)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/15"
                    >
                        <div className="flex items-center justify-between border-b border-border bg-background/80 px-5 py-4">
                            <div>
                                <p className="font-playfair text-xl font-semibold text-foreground">Appel vidéo WebRTC</p>
                                <p className="text-xs text-muted-foreground">{connected ? status : 'Connexion au serveur...'}</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="rounded-xl border border-border p-2 text-muted-foreground hover:text-primary">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_280px]">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <VideoTile label="Moi" stream={localStreamRef.current} muted videoRef={localVideoRef} />
                                {remoteStreams.length === 0 ? (
                                    <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/50 p-6 text-center text-sm text-muted-foreground">
                                        En attente d’un interlocuteur...
                                    </div>
                                ) : (
                                    remoteStreams.map(({ id, stream }) => (
                                        <VideoTile
                                            key={id}
                                            label={participants.find((item) => item.id === id)?.name || 'Invité'}
                                            stream={stream}
                                        />
                                    ))
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-border bg-background/70 p-4">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Nom</label>
                                    <input
                                        value={userName}
                                        onChange={(event) => setUserName(event.target.value)}
                                        className="mt-2 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary/50"
                                    />

                                    <button
                                        onClick={createRoom}
                                        disabled={!connected || mediaStarted}
                                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Video className="h-4 w-4" />
                                        Créer une salle
                                    </button>
                                </div>

                                <form onSubmit={joinRoom} className="rounded-2xl border border-border bg-background/70 p-4">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Code de salle</label>
                                    <input
                                        value={joinRoomId}
                                        onChange={(event) => setJoinRoomId(event.target.value)}
                                        placeholder="Collez le code ici"
                                        className="mt-2 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary/50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!connected || mediaStarted || !joinRoomId.trim()}
                                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Phone className="h-4 w-4" />
                                        Rejoindre
                                    </button>
                                </form>

                                {roomId && (
                                    <button
                                        onClick={copyRoomId}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-semibold text-muted-foreground transition hover:text-primary"
                                    >
                                        <Copy className="h-4 w-4" />
                                        Copier le code: {roomId.slice(0, 8)}...
                                    </button>
                                )}

                                {error && <p className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/80 px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                {participants.length + (mediaStarted ? 1 : 0)} participant{participants.length + (mediaStarted ? 1 : 0) > 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center gap-2">
                                <ControlButton onClick={toggleAudio} active={audioEnabled} disabled={!mediaStarted}>
                                    {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                </ControlButton>
                                <ControlButton onClick={toggleVideo} active={videoEnabled} disabled={!mediaStarted}>
                                    {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                                </ControlButton>
                                <button
                                    onClick={() => cleanupCall()}
                                    disabled={!mediaStarted}
                                    className="flex h-10 items-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <PhoneOff className="h-4 w-4" />
                                    Terminer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setOpen((value) => !value)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 transition hover:bg-primary/90"
                whileTap={{ scale: 0.95 }}
                aria-label="Ouvrir l'appel vidéo"
            >
                {open ? <X className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </motion.button>
        </div>
    );
}

function VideoTile({ label, stream, muted = false, videoRef }) {
    const fallbackRef = useRef(null);
    const ref = videoRef || fallbackRef;

    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [ref, stream]);

    return (
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-950">
            {stream ? (
                <video ref={ref} autoPlay playsInline muted={muted} className="h-full w-full object-cover" />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">Caméra inactive</div>
            )}
            <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
                {label}
            </span>
        </div>
    );
}

function ControlButton({ children, onClick, active, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                active
                    ? 'border-border bg-card text-foreground hover:border-primary/50 hover:text-primary'
                    : 'border-destructive/50 bg-destructive/10 text-destructive'
            }`}
        >
            {children}
        </button>
    );
}
