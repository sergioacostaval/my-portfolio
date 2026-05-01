# Portfolio Professionnel & Communication Temps Reel

Portfolio full-stack construit avec React, Tailwind CSS, Node.js, Express, Socket.IO et WebRTC. Le projet inclut un site portfolio responsive, un chat texte en temps reel, des notifications Telegram et une fonctionnalite d'appel video basee sur WebRTC.

## Stack

**Frontend**
- React + Vite
- Tailwind CSS
- React Router
- Framer Motion
- Socket.IO Client
- WebRTC natif
- EmailJS

**Backend**
- Node.js
- Express
- Socket.IO
- dotenv
- CORS
- Telegram Bot API

**Infrastructure**
- Docker
- Docker Compose

## Structure

```text
portfolio_chat/
|-- client/                 # Application React/Vite
|   |-- Dockerfile
|   |-- .env.example
|   `-- src/
|-- server/                 # Serveur Express + Socket.IO
|   |-- Dockerfile
|   |-- .env.example
|   `-- server.js
|-- docker-compose.yml
|-- .env.example
|-- package.json
`-- README.md
```

## Variables D'environnement

Copier les fichiers d'exemple avant de lancer le projet.

```bash
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Sur Windows PowerShell, creer les fichiers manuellement ou copier le contenu des `.env.example`.

### Racine `.env`

Utilise par `docker-compose.yml` et par le backend quand il est lance depuis la racine.

```env
PORT=3001
CLIENT_URL=http://localhost:5173
ADMIN_DASHBOARD_URL=http://localhost:5173/chat

NOTIFY_CHANNEL=telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### Client `client/.env`

```env
VITE_CHAT_SERVER_URL=http://localhost:3001
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### Serveur `server/.env`

```env
PORT=3001
CLIENT_URL=http://localhost:5173
ADMIN_DASHBOARD_URL=http://localhost:5173/chat

NOTIFY_CHANNEL=telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

Ne jamais publier les fichiers `.env` reels. Utiliser seulement les `.env.example` dans Git.

## Installation Locale

Installer les dependances de la racine et du client.

```bash
npm install
cd client
npm install
cd ..
```

Lancer frontend et backend ensemble:

```bash
npm run dev
```

URLs locales:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Admin chat: `http://localhost:5173/chat`

Tester rapidement le backend:

```bash
curl http://localhost:3001/api/live-chat/rooms
```

## Docker

Le projet peut etre lance avec une seule commande:

```bash
docker-compose up --build
```

Services exposes:

- `portfolio-client`: `http://localhost:5173`
- `portfolio-server`: `http://localhost:3001`

Verifier les conteneurs:

```bash
docker-compose ps
```

Voir les logs:

```bash
docker-compose logs --tail=40 client
docker-compose logs --tail=40 server
```

Arreter les services:

```bash
docker-compose down
```

## Fonctionnalites

### Portfolio

- Hero responsive avec animation
- Sections A propos, competences, projets, contact et footer
- Mode clair/sombre avec toggle
- Navigation fluide avec header fixe
- Animations Framer Motion

### Chat Temps Reel

- Bouton flottant integre au portfolio
- Messages en temps reel avec Socket.IO
- Salles de conversation visiteur/admin
- Historique en memoire pendant la session serveur
- Horodatage cote serveur
- Notification Telegram au premier message visiteur
- Interface admin disponible sur `/chat`

### Appel Video WebRTC

- Creation de salle video
- Rejoindre une salle par code
- Acces camera/micro avec `getUserMedia`
- Video locale et video distante
- Mute/unmute microphone
- Activation/desactivation camera
- Terminer l'appel et liberation des ressources
- Signalisation WebRTC via Socket.IO
- Serveurs STUN publics Google

Note: en production, WebRTC/getUserMedia exige HTTPS.

## Scripts

```bash
npm run dev          # Lance client + serveur
npm run dev:client   # Lance seulement Vite
npm run dev:server   # Lance seulement Express/Socket.IO
npm run build        # Build du frontend
npm run preview      # Preview du build frontend
npm run lint         # ESLint
```

## Endpoints Principaux

Chat:

- `POST /api/live-chat/notify`
- `GET /api/live-chat/rooms`

Video:

- `POST /api/video/rooms`
- `GET /api/video/rooms/:roomId`

Socket.IO:

- `join-room`
- `message`
- `video:join-room`
- `video:offer`
- `video:answer`
- `video:ice-candidate`
- `video:leave-room`

## Deploiement

Deploiement actuel:

- Frontend Vercel: `https://my-portfolio-two-theta-kq3fil0jzy.vercel.app`
- Backend Render: `https://my-portfolio-api-1ldo.onrender.com`
- Admin chat: `https://my-portfolio-two-theta-kq3fil0jzy.vercel.app/chat`

Tests rapides:

```bash
curl https://my-portfolio-api-1ldo.onrender.com/api/live-chat/rooms
curl https://my-portfolio-api-1ldo.onrender.com/api/video/rooms/test
```

Variables importantes en production:

- `CLIENT_URL`: `https://my-portfolio-two-theta-kq3fil0jzy.vercel.app`
- `ADMIN_DASHBOARD_URL`: `https://my-portfolio-two-theta-kq3fil0jzy.vercel.app/chat`
- `VITE_CHAT_SERVER_URL`: `https://my-portfolio-api-1ldo.onrender.com`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

Le frontend utilise `client/vercel.json` pour rediriger les routes React vers `index.html`. Cela permet d'ouvrir directement `/chat?roomId=...` depuis Telegram.

## Securite

- Les `.env` reels sont ignores par Git.
- Les tokens Telegram et les cles EmailJS ne doivent pas etre hardcodes dans le code source.
- Si un token a deja ete publie dans GitHub, il faut le regenerer.

## Etat Du Projet

Fonctionnel localement:

- Portfolio React
- Chat texte Socket.IO
- Notifications Telegram
- Appel video WebRTC
- Docker Compose local
- Deploiement Vercel + Render

A completer pour couvrir tout le cahier des charges:

- API REST complete avec JWT/CRUD
- Base de donnees
- Documentation Swagger ou Postman
- Tests production WebRTC sous HTTPS
