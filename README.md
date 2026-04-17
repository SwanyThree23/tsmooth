# T-Smooth Productions

**Full-Stack Web Application by SwanyThree & Domino Entertainment Ent.**

A comprehensive production-ready platform for live streaming, AI-powered content creation, Watch Parties, community engagement, and business management.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Quick Start](#quick-start)
5. [Supabase Setup](#supabase-setup)
6. [Stripe Payments Setup](#stripe-payments-setup)
7. [LiveKit Watch Party Setup](#livekit-watch-party-setup)
8. [VPS Deployment (Hostinger)](#vps-deployment-hostinger)
9. [API Reference](#api-reference)
10. [Database Schema](#database-schema)
11. [WebSocket Events](#websocket-events)
12. [Environment Variables](#environment-variables)
13. [PWA](#pwa)

---

## Features

### 🎥 Production & Streaming
| Feature | Description |
|---|---|
| **Dashboard** | Real-time stats (viewers, views, AI gens, tokens saved, revenue), live camera preview, project & video widgets |
| **Video Showcase** | Grid display, iframe modal player (YouTube / Vimeo / HeyGen), view counter, CRUD |
| **Multi-Platform Streaming** | Camera/screen capture, YouTube · Twitch · Kick · Facebook · LinkedIn toggles |
| **RTMP Fanout** | Push to unlimited RTMP targets simultaneously; OBS WebSocket connector; activity log |
| **PRISM Live Studio** | Scene switching, Prism Lens effects, virtual camera, EvMux multi-stream |
| **VDO.Ninja** | WebRTC room creation, push/view URLs, podcast rooms |
| **Steam Deck** | Game library, FPS/temp/battery metrics, game stream capture |

### 🤖 AI Tools
| Tool | Description |
|---|---|
| **OpenRouter Chatbot** | Multi-turn memory, Claude Sonnet 4, persistent history |
| **HeyGen Video** | AI avatar video generation from script |
| **ElevenLabs Voice** | Text-to-speech with voice selection, base64 audio playback |
| **WisprFlow** | Audio URL transcription |
| **LLMLingua** | Text compression with token savings calculator |
| **Whisper** | OpenAI Whisper transcription (with OpenRouter fallback) |

### 🎙️ NotebookLM Podcast Studio
- Multi-source ingestion: PDF, Website, Document, YouTube
- Dual-host AI script generation (Claude Sonnet 4)
- Configurable duration: 5 / 10 / 15 / 20 minutes
- ElevenLabs stereo voice synthesis
- HeyGen avatar video output
- Live streaming controls (VDO.Ninja + EvMux)

### 📺 Community — Watch Party
- Create rooms with unique 8-char codes (share link)
- Join up to **20 simultaneous panel members**
- YouTube embed with **host-synced play/pause** across all viewers
- LiveKit WebRTC video/audio for panelists
- Host controls: **promote viewer → panelist**, **kick member**, **go live / end live**
- Embedded Live Chat + Tip Jar in sidebar

### 💬 Live Chat
- Persistent message history via PostgreSQL
- Real-time delivery via Socket.io rooms
- Typing indicators
- Soft-delete with author & admin moderation
- Pagination cursor support

### 💰 Tip Jar & Stripe Connect
- Creator connects Stripe in one click (Express onboarding)
- **90% to creator / 10% platform** split — enforced via `application_fee_amount`
- Preset amounts: $1 · $5 · $10 · $25 · $50 · $100
- Custom amount with per-tip breakdown shown before payment
- Real-time tip notifications via WebSocket
- Stripe webhook confirms payment and updates DB
- Full tip history per user

### 🏆 Tip Leaderboard
- Gold / Silver / Bronze podium (top 3)
- Full ranked list: total tipped + tip count
- Auto-refreshes on incoming tips via WebSocket

### 📁 Business Suite
| Module | Fields |
|---|---|
| **Projects** | Name, client, status, priority, budget, progress, deadline, tags |
| **Clients** | Name, email, phone, company, industry, revenue, project count |
| **Invoices** | Number, client, project, amount, status (draft/pending/paid), due date |
| **Tasks** | Kanban board (To Do / In Progress / Done), priority, due date |
| **Notes** | Title, content, tags, timestamps |

---

## Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite 5** — blazing fast HMR and builds
- **Tailwind CSS** — dark glassmorphism design system
- **Lucide React** — icon library
- **Socket.io Client** — real-time events
- **React Router v6** — client-side routing
- **PWA** — manifest + service worker (offline shell, push notifications)

### Backend
- **Node.js** + **Express** + TypeScript
- **Prisma ORM** — type-safe DB access
- **PostgreSQL** via **Supabase** (connection pooling + realtime)
- **JWT** + **bcrypt** — auth
- **Socket.io** — WebSocket server with named rooms
- **Stripe SDK** — payments + Connect
- **LiveKit Server SDK** — WebRTC token generation
- **Helmet** + **express-rate-limit** — security

### Infrastructure
- **Docker** + docker-compose (dev & prod)
- **Supabase** — hosted Postgres + connection pooler
- **Hostinger VPS** — `srv1587098.hstgr.cloud` (2.24.198.112)
- **n8n** automation — `https://n8n.srv1587098.hstgr.cloud`

---

## Project Structure

```
tsmooth/
├── client/
│   ├── public/
│   │   ├── manifest.json        # PWA manifest
│   │   └── sw.js                # Service worker
│   └── src/
│       ├── components/
│       │   ├── Dashboard.tsx
│       │   ├── Videos.tsx
│       │   ├── Streaming.tsx
│       │   ├── RTMPFanout.tsx   # RTMP multi-target fanout
│       │   ├── AITools.tsx
│       │   ├── Podcast.tsx
│       │   ├── PrismLive.tsx
│       │   ├── VDONinja.tsx
│       │   ├── SteamDeck.tsx
│       │   ├── WatchParty.tsx   # LiveKit + YouTube sync
│       │   ├── LiveChat.tsx     # Persistent chat
│       │   ├── TipJar.tsx       # Stripe 90/10 split
│       │   ├── Leaderboard.tsx  # Top tippers podium
│       │   ├── Projects.tsx
│       │   ├── Clients.tsx
│       │   ├── Invoices.tsx
│       │   ├── Tasks.tsx
│       │   ├── Notes.tsx
│       │   ├── Layout.tsx       # Sidebar nav (4 sections)
│       │   └── Login.tsx
│       ├── contexts/AuthContext.tsx
│       ├── services/
│       │   ├── api.ts           # Typed API client
│       │   └── socket.ts        # Socket.io singleton
│       └── types/index.ts
├── server/
│   └── src/
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── projects.ts
│       │   ├── clients.ts
│       │   ├── invoices.ts
│       │   ├── videos.ts
│       │   ├── tasks.ts
│       │   ├── notes.ts
│       │   ├── ai.ts            # OpenRouter, HeyGen, ElevenLabs, Whisper
│       │   ├── podcast.ts
│       │   ├── streaming.ts
│       │   ├── vdo.ts
│       │   ├── steam.ts
│       │   ├── tips.ts          # Stripe Connect + webhook
│       │   ├── watchparty.ts    # LiveKit token + room sync
│       │   └── chat.ts          # Persistent chat history
│       ├── middleware/
│       │   ├── auth.ts
│       │   └── errorHandler.ts
│       ├── prisma/schema.prisma
│       └── index.ts
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ **or** a [Supabase](https://supabase.com) project (recommended)
- Docker & Docker Compose (optional for local Postgres)

### 1. Clone & Install

```bash
git clone https://github.com/SwanyThree23/tsmooth.git
cd tsmooth
npm run install:all
```

### 2. Environment Variables

```bash
cp .env.example .env
# Edit .env — see Environment Variables section below
```

### 3. Database & Migrations

```bash
# Option A — Docker (local Postgres)
docker-compose up -d postgres
npm run migrate

# Option B — Supabase (see Supabase Setup below)
npm run migrate
```

### 4. Start Development

```bash
npm run dev
# Frontend → http://localhost:5173
# Backend  → http://localhost:3001
```

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database** and copy the connection strings
3. Set in `.env`:

```env
# Connection pooler (PgBouncer) — use for all app queries
DATABASE_URL="postgresql://postgres.YOUR_REF:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection — use for migrations only
DIRECT_URL="postgresql://postgres.YOUR_REF:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

SUPABASE_URL=https://YOUR_REF.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

4. Run migrations:

```bash
npm run migrate
```

> Your project ref is `rxlgywvfclyjdfyvfvyc` — replace `[PASSWORD]` with your DB password.

---

## Stripe Payments Setup

### Creator (receiving tips)
1. Creator clicks **"Connect Stripe"** in the Tip Jar page
2. Completes Stripe Express onboarding
3. Can now receive tips directly to their bank

### Platform (sending tips)
1. Create a Stripe account at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Enable **Connect** in the Stripe Dashboard
3. Add to `.env`:

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PLATFORM_FEE_PERCENT=10
```

4. Register the webhook endpoint in Stripe Dashboard:
   - URL: `https://your-domain.com/api/tips/webhook`
   - Event: `payment_intent.succeeded`

> **Split:** 90% goes to the creator's Stripe account via `transfer_data.destination`. The 10% platform fee stays on the platform account via `application_fee_amount`.

---

## LiveKit Watch Party Setup

1. Create a project at [livekit.io](https://livekit.io) (free tier available)
2. Add to `.env`:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxx
LIVEKIT_API_SECRET=your_secret
```

3. The server generates signed tokens — clients connect via the LiveKit JS SDK (integrate `@livekit/components-react` in the frontend for full AV UI).

---

## VPS Deployment (Hostinger)

Your VPS: **srv1587098.hstgr.cloud** · IP: **2.24.198.112**

### Option A — Docker (recommended)

```bash
# SSH into VPS
ssh root@2.24.198.112

# Clone repo
git clone https://github.com/SwanyThree23/tsmooth.git
cd tsmooth

# Configure environment
cp .env.example .env
nano .env   # fill in all keys

# Deploy
docker-compose up -d

# Run migrations
docker-compose exec server npx prisma migrate deploy
```

### Option B — PM2 (Node directly)

```bash
# Install Node 20 + PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# Install & build
npm run install:all
npm run build

# Run migrations
npm run migrate:deploy

# Start with PM2
pm2 start server/dist/index.js --name tsmooth-server
pm2 save
pm2 startup
```

### Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name srv1587098.hstgr.cloud;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }

    location / {
        root /path/to/tsmooth/client/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## API Reference

### Authentication
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login → JWT
GET    /api/auth/me                Get current user
```

### Resources (all require Bearer token)
```
GET    /api/{resource}             List all (user-scoped)
POST   /api/{resource}            Create
PUT    /api/{resource}/:id        Update
DELETE /api/{resource}/:id        Delete
```
Resources: `projects` · `clients` · `invoices` · `videos` · `tasks` · `notes`

### AI
```
POST   /api/ai/chat                      OpenRouter / Claude Sonnet 4 chat
POST   /api/ai/heygen/generate           HeyGen avatar video
POST   /api/ai/elevenlabs/generate       ElevenLabs TTS → base64 audio
POST   /api/ai/wisprflow/transcribe      WisprFlow audio transcription
POST   /api/ai/llmlingua/compress        Text compression + token savings
POST   /api/ai/whisper/transcribe        OpenAI Whisper (+ OpenRouter fallback)
```

### Podcast
```
POST   /api/podcast/sources        Add source (PDF/URL/YouTube)
GET    /api/podcast/sources        List sources
POST   /api/podcast/generate       Generate script via AI
```

### Streaming & RTMP
```
GET    /api/streaming/status       Current stream state
POST   /api/streaming/start        Start stream (emit Socket event)
POST   /api/streaming/stop         Stop stream
POST   /api/vdo/create-room        Create VDO.Ninja room
GET    /api/vdo/rooms              List user's rooms
POST   /api/steam/connect          Connect Steam Deck
GET    /api/steam/games            Game library
POST   /api/steam/stream/start     Start game stream
POST   /api/steam/stream/stop      Stop game stream
```

### Watch Party
```
GET    /api/watchparty                        List live parties
POST   /api/watchparty                        Create party → LiveKit token
GET    /api/watchparty/:roomCode              Get party details
POST   /api/watchparty/:roomCode/join         Join → LiveKit token
POST   /api/watchparty/:roomCode/sync         Sync video state (host only)
POST   /api/watchparty/:roomCode/live         Toggle live status (host only)
POST   /api/watchparty/:roomCode/promote/:id  Promote viewer → panelist
DELETE /api/watchparty/:roomCode/members/:id  Kick member
```

### Live Chat
```
GET    /api/chat/:roomId           Message history (paginated)
POST   /api/chat/:roomId           Send message
DELETE /api/chat/:roomId/:msgId    Delete message (author or admin)
GET    /api/chat                   List rooms user has chatted in
```

### Tips & Stripe
```
POST   /api/tips/connect/onboard         Creator Stripe Connect onboarding URL
GET    /api/tips/connect/status          Check Connect account status
POST   /api/tips/create-payment-intent   Create payment intent (90/10 split)
POST   /api/tips/webhook                 Stripe webhook (raw body)
GET    /api/tips/leaderboard             Top tippers (all-time)
GET    /api/tips/history                 User tip history
```

---

## Database Schema

```prisma
User              # Auth, profiles, Stripe account ID
Project           # Name, client, status, priority, budget, progress, deadline, tags
Client            # Contact info, totalPaid, projectCount
Invoice           # invoiceNumber, amount, status, dueDate
Video             # embedUrl, thumbnail, source, category, tags, views
Task              # Kanban status, priority, dueDate, completed
Note              # title, content, tags, updatedAt

Tip               # amount, message, stripePaymentId, status, sender↔receiver
ChatMessage       # roomId, content, messageType, userId, deleted
WatchParty        # title, hostId, videoUrl, roomCode, videoState (JSON), isLive, maxMembers
WatchPartyMember  # watchPartyId, userId, role (host/panelist/viewer), liveKitToken
```

---

## WebSocket Events

### Client → Server
```javascript
socket.emit('room:join',    roomId)           // Join a chat or watch party room
socket.emit('room:leave',   roomId)           // Leave room
socket.emit('chat:typing',  { roomId, name }) // Typing indicator
socket.emit('party:sync',   { roomCode, ... })// Video sync relay
socket.emit('tip:sent',     { roomId, amount })// Tip notification relay
socket.emit('stream:status',{ isStreaming })  // Broadcast stream state
```

### Server → Client
```javascript
socket.on('chat:message',    msg)             // New chat message
socket.on('chat:deleted',    { messageId })   // Message deleted
socket.on('chat:typing',     { name })        // Typing indicator
socket.on('party:sync',      state)           // Video state sync
socket.on('party:member-joined', data)        // New party member
socket.on('party:kicked',    { userId })      // Member removed
socket.on('party:status',    { isLive })      // Party live status change
socket.on('party:promoted',  { userId })      // Member promoted
socket.on('tip:received',    { amount, msg }) // Incoming tip notification
socket.on('stream:status',   data)            // Stream status update
socket.on('viewer:count',    { viewers })     // Live viewer count
socket.on('viewer:join')                      // Viewer joined
socket.on('viewer:leave')                     // Viewer left
```

---

## Environment Variables

```env
# ── Server ──────────────────────────────────────────────
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change_me_in_production

# ── Supabase (recommended) ───────────────────────────────
DATABASE_URL="postgresql://postgres.REF:[PASS]@pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.REF:[PASS]@db.supabase.co:5432/postgres"
SUPABASE_URL=https://REF.supabase.co
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# ── AI Services ──────────────────────────────────────────
OPENROUTER_API_KEY=       # chat, podcast scripts, Whisper fallback
HEYGEN_API_KEY=           # AI avatar video
ELEVENLABS_API_KEY=       # text-to-speech
WISPRFLOW_API_KEY=        # audio transcription
OPENAI_API_KEY=           # Whisper transcription (optional, OpenRouter used as fallback)

# ── Stripe ───────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PLATFORM_FEE_PERCENT=10

# ── LiveKit (Watch Party WebRTC) ─────────────────────────
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# ── Streaming Keys ────────────────────────────────────────
YOUTUBE_STREAM_KEY=
TWITCH_STREAM_KEY=
KICK_STREAM_KEY=
FACEBOOK_STREAM_KEY=
LINKEDIN_STREAM_KEY=

# ── Hostinger VPS ─────────────────────────────────────────
# VPS:  srv1587098.hstgr.cloud  (2.24.198.112)
# n8n:  https://n8n.srv1587098.hstgr.cloud
RTMP_SERVER_URL=rtmp://2.24.198.112/live
```

---

## PWA

The app ships as a **Progressive Web App**:

- `client/public/manifest.json` — app name, icons, theme colour (`#7c3aed`), display `standalone`
- `client/public/sw.js` — service worker:
  - **Network-first** for navigation (falls back to `/` shell offline)
  - **Cache-first** for static assets
  - **Push notification** support (subscribe via `registration.pushManager`)
- Install prompt appears on Chrome/Edge/Android automatically

---

## Security

- JWT authentication (7-day expiry)
- bcrypt password hashing (10 rounds)
- Helmet.js — security response headers
- CORS — origin whitelist
- express-rate-limit — 500 req / 15 min window
- Prisma — parameterised queries (no SQL injection)
- Raw body middleware scoped to Stripe webhook route only
- Stripe webhook signature verification (`constructEvent`)

---

## Development Scripts

```bash
npm run dev              # Start client + server concurrently
npm run build            # Build client + server
npm run start            # Run production build
npm run migrate          # Prisma migrate dev
npm run migrate:deploy   # Prisma migrate deploy (CI/prod)
npm run studio           # Prisma Studio GUI
npm run install:all      # Install root + client + server deps
```

---

## License

MIT — see [LICENSE](./LICENSE)

## Contributing

This is a production project by **SwanyThree & Domino Entertainment Ent.**

---

**Built with passion by SwanyThree & Domino Entertainment Ent.**
