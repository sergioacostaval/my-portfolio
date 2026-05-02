import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import crypto from "node:crypto";
import axios from "axios";
const firstMessages = new Map(); // roomId -> first message


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

// ─────────────────────────────
// MEMORY STORE
// ─────────────────────────────
const roomMessages = new Map();
const waitingRooms = new Map();
const videoRooms = new Map();
const socketVideoRoom = new Map();

const MAX_HISTORY = 100;

function getHistory(roomId) {
    return roomMessages.get(roomId) || [];
}

// Garde seulement les derniers messages pour eviter une memoire trop grande.
function saveMessage(roomId, msg) {
    const history = getHistory(roomId);
    roomMessages.set(roomId, [...history, msg].slice(-MAX_HISTORY));
}

// ─────────────────────────────
// TELEGRAM
// ─────────────────────────────
// Envoie une notification Telegram quand un visiteur ouvre le chat.
async function notifyTelegram({ roomId, visitorName, pageUrl }) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.log("❌ Missing Telegram env");
        return;
    }

    const text =
        `🟢 Nouveau visiteur

👤 ${visitorName}
🆔 Room: ${roomId}
🌐 ${pageUrl}`;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text,
        });
    } catch (err) {
        console.log("❌ Telegram error:", err.response?.data || err.message);
    }
}

// ─────────────────────────────
// NOTIFY (OPEN CHAT)
// ─────────────────────────────
// Cree une salle de chat et previent l'admin qu'un visiteur attend.
app.post("/api/live-chat/notify", async (req, res) => {
    const roomId = req.body?.roomId || crypto.randomUUID();
    const visitorName = req.body?.visitorName || "Anonyme";
    const pageUrl = req.body?.pageUrl || "";

    if (!waitingRooms.has(roomId)) {
        waitingRooms.set(roomId, {
            roomId,
            visitorName,
            pageUrl,
            status: "waiting",
            createdAt: new Date().toISOString(),
        });
    }

    io.emit("rooms-updated", [...waitingRooms.values()]);

    await notifyTelegram({ roomId, visitorName, pageUrl });

    res.json({ ok: true, roomId });
});

// ─────────────────────────────
// ADMIN GET ROOMS (backup)
app.get("/api/live-chat/rooms", (req, res) => {
    res.json({ rooms: [...waitingRooms.values()] });
});

// Cree une nouvelle salle video avec un identifiant unique.
app.post("/api/video/rooms", (req, res) => {
    const roomId = crypto.randomUUID();

    videoRooms.set(roomId, {
        roomId,
        participants: [],
        createdAt: new Date().toISOString(),
    });

    res.json({ ok: true, roomId });
});

app.get("/api/video/rooms/:roomId", (req, res) => {
    const room = videoRooms.get(req.params.roomId);

    res.json({
        exists: Boolean(room),
        participants: room?.participants || [],
    });
});

// ─────────────────────────────
// SOCKET SYSTEM
// Envoie a Telegram le premier message du visiteur avec un lien vers l'admin.
async function notifyTelegramFirstMessage({ roomId, visitorName, message }) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) return;

    const adminLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/chat?roomId=${roomId}`;

    const text =
        `🟢 Nouveau chat ouvert

👤 ${visitorName}
🆔 Room: ${roomId}

💬 Premier message:
"${message}"

👉 Ouvrir chat admin:
${adminLink}`;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text,
            disable_web_page_preview: true,
        });
    } catch (err) {
        console.log("❌ Telegram error:", err.response?.data || err.message);
    }
}
// ─────────────────────────────
io.on("connection", (socket) => {
    console.log("🟢 Connecté:", socket.id);

    // JOIN ROOM
    // Ces evenements gerent le chat en temps reel avec Socket.IO.
    socket.on("join-room", ({ roomId, role }) => {
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.role = role;

        socket.emit("history", getHistory(roomId));
    });

    // MESSAGE
    // Recoit un message du visiteur ou de l'admin et le renvoie a la salle.
    socket.on("message", (data) => {
        const text = (data?.text || "").trim();
        const sender = data?.sender;
        const roomId = data?.roomId;

        if (!text || !roomId) return;

        const msg = {
            id: crypto.randomUUID(),
            roomId,
            text,
            sender,
            time: new Date().toISOString(),
        };

        saveMessage(roomId, msg);

        // ─────────────────────────────
        // 🔥 CAPTURE PREMIER MESSAGE VISITOR
        // ─────────────────────────────
        // La notification Telegram est envoyee une seule fois par salle.
        if (sender === "visitor" && !firstMessages.has(roomId)) {
            firstMessages.set(roomId, msg);

            // send Telegram with FIRST MESSAGE
            notifyTelegramFirstMessage({
                roomId,
                visitorName: "Visiteur portfolio",
                message: msg.text,
            });
        }

        io.to(roomId).emit("message", msg);

        console.log(`💬 [${sender}] ${text}`);
    });

    socket.on("video:leave-room", () => {
        leaveVideoRoom(socket);
    });

    // L'utilisateur rejoint une salle video. Le serveur garde la liste des participants.
    socket.on("video:join-room", ({ roomId, userName }) => {
        if (!roomId) return;

        socket.join(roomId);
        socket.data.videoRoomId = roomId;
        socket.data.videoUserName = userName || "Utilisateur";
        socketVideoRoom.set(socket.id, roomId);

        if (!videoRooms.has(roomId)) {
            videoRooms.set(roomId, {
                roomId,
                participants: [],
                createdAt: new Date().toISOString(),
            });
        }

        const room = videoRooms.get(roomId);
        room.participants = room.participants.filter((participant) => participant.id !== socket.id);

        const participant = {
            id: socket.id,
            name: socket.data.videoUserName,
            joinedAt: new Date().toISOString(),
        };

        room.participants.push(participant);

        // Le nouveau participant recoit la liste des personnes deja dans la salle.
        socket.emit("video:room-participants", room.participants.filter((item) => item.id !== socket.id));
        socket.to(roomId).emit("video:user-joined", participant);
        io.to(roomId).emit("video:participants-updated", room.participants);
    });

    // Le serveur transmet l'offre WebRTC a l'autre utilisateur.
    socket.on("video:offer", ({ targetUserId, offer }) => {
        if (!targetUserId || !offer) return;

        io.to(targetUserId).emit("video:offer", {
            fromUserId: socket.id,
            fromUserName: socket.data.videoUserName || "Utilisateur",
            offer,
        });
    });

    // Le serveur transmet la reponse WebRTC a l'utilisateur qui a cree l'offre.
    socket.on("video:answer", ({ targetUserId, answer }) => {
        if (!targetUserId || !answer) return;

        io.to(targetUserId).emit("video:answer", {
            fromUserId: socket.id,
            answer,
        });
    });

    // Les candidats ICE aident les navigateurs a trouver le meilleur chemin reseau.
    socket.on("video:ice-candidate", ({ targetUserId, candidate }) => {
        if (!targetUserId || !candidate) return;

        io.to(targetUserId).emit("video:ice-candidate", {
            fromUserId: socket.id,
            candidate,
        });
    });

    socket.on("disconnect", () => {
        leaveVideoRoom(socket);
        console.log("🔴 Déconnecté:", socket.id);
    });
});

// Nettoie la salle quand un utilisateur quitte ou ferme la page.
function leaveVideoRoom(socket) {
    const roomId = socketVideoRoom.get(socket.id) || socket.data.videoRoomId;
    if (!roomId) return;

    const room = videoRooms.get(roomId);
    if (room) {
        room.participants = room.participants.filter((participant) => participant.id !== socket.id);
        socket.to(roomId).emit("video:user-left", { id: socket.id });
        io.to(roomId).emit("video:participants-updated", room.participants);

        if (room.participants.length === 0) {
            videoRooms.delete(roomId);
        }
    }

    socket.leave(roomId);
    socketVideoRoom.delete(socket.id);
    socket.data.videoRoomId = undefined;
}

server.listen(process.env.PORT || 3001, () => {
    console.log("🚀 Server running on http://localhost:3001");
});
