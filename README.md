# T-Smooth Productions

**Full-Stack Web Application by SwanyThree & Domino Entertainment Ent.**

A comprehensive production-ready platform for streaming, video production, AI-powered content creation, and project management.

![Tech Stack](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

## Features

### 🎥 Core Platform
- **Dashboard** - Real-time stats, live streaming preview, project overview
- **Video Showcase** - Grid display with iframe embeds, view tracking
- **Multi-Platform Streaming** - YouTube, Twitch, Kick, Facebook, LinkedIn
- **Project Management** - CRUD operations with progress tracking
- **Client Management** - Contact management with revenue tracking
- **Invoice System** - Draft, pending, and paid invoices
- **Task Board** - Kanban-style task management
- **Notes** - Rich note-taking with tags

### 🤖 AI Tools Integration
- **OpenRouter Chatbot** - Claude Sonnet 4 powered conversations
- **HeyGen Video Generation** - AI avatar video creation
- **ElevenLabs Voice** - Text-to-speech with multiple voices
- **WisprFlow Transcription** - Audio transcription service
- **LLMLingua Compression** - Token optimization for LLMs

### 🎙️ NotebookLM Podcast Studio
- Multi-source ingestion (PDF, Website, Documents, YouTube)
- AI-powered script generation
- Dual-host podcast creation
- Configurable duration (5-20 minutes)
- ElevenLabs voice synthesis
- HeyGen video avatar integration

### 📡 Advanced Streaming
- **PRISM Live Studio** - Scene management with virtual effects
- **EvMux** - Multi-platform simultaneous streaming
- **VDO.Ninja** - WebRTC room creation and management
- **Steam Deck Integration** - Game streaming with performance metrics

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Socket.io Client** for real-time updates
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **JWT** authentication with bcrypt
- **Socket.io** for WebSocket connections
- **Helmet** for security

### Infrastructure
- **Docker** & Docker Compose
- **PostgreSQL** database
- **Nginx** (production ready)

## Quick Start

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL 16+ (or use Docker)
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SwanyThree23/tsmooth.git
cd tsmooth
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server
PORT=3001
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key

# Database
DATABASE_URL=postgresql://tsmooth:tsmooth_password@localhost:5432/tsmooth_db

# AI Services (optional)
OPENROUTER_API_KEY=your_openrouter_key
HEYGEN_API_KEY=your_heygen_key
ELEVENLABS_API_KEY=your_elevenlabs_key
WISPRFLOW_API_KEY=your_wisprflow_key
```

4. **Set up database**
```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Run migrations
npm run migrate
```

5. **Start development servers**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Docker Deployment

### Development with Docker
```bash
docker-compose up
```

### Production Build
```bash
# Build the application
npm run build

# Build and run Docker containers
docker-compose up -d
```

## Project Structure

```
tsmooth-productions/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── services/      # API & Socket services
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & error handling
│   │   ├── prisma/        # Database schema
│   │   └── index.ts       # Server entry point
│   └── tsconfig.json
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## API Documentation

### Authentication
```
POST /api/auth/register  - Register new user
POST /api/auth/login     - Login user
GET  /api/auth/me        - Get current user
```

### Resources
All resources follow RESTful conventions:
```
GET    /api/{resource}      - List all
GET    /api/{resource}/:id  - Get one
POST   /api/{resource}      - Create
PUT    /api/{resource}/:id  - Update
DELETE /api/{resource}/:id  - Delete
```

Resources: `projects`, `clients`, `invoices`, `videos`, `tasks`, `notes`

### AI Services
```
POST /api/ai/chat                    - OpenRouter chat
POST /api/ai/heygen/generate         - Generate HeyGen video
POST /api/ai/elevenlabs/generate     - Generate voice audio
POST /api/ai/wisprflow/transcribe    - Transcribe audio
POST /api/ai/llmlingua/compress      - Compress text
```

### Podcast
```
POST /api/podcast/sources   - Add source
GET  /api/podcast/sources   - List sources
POST /api/podcast/generate  - Generate podcast
```

### Streaming
```
GET  /api/streaming/status  - Get streaming status
POST /api/streaming/start   - Start stream
POST /api/streaming/stop    - Stop stream
```

### VDO.Ninja
```
POST /api/vdo/create-room   - Create VDO room
GET  /api/vdo/rooms         - List user rooms
```

### Steam Deck
```
POST /api/steam/connect     - Connect Steam Deck
GET  /api/steam/status      - Get status
GET  /api/steam/games       - List games
POST /api/steam/stream/start - Start game stream
POST /api/steam/stream/stop  - Stop game stream
```

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key models:

- **User** - Authentication and user profiles
- **Project** - Project management with progress tracking
- **Client** - Client information and relationships
- **Invoice** - Billing and payment tracking
- **Video** - Video showcase with view counts
- **Task** - Task management with Kanban status
- **Note** - Rich note-taking with tags

## WebSocket Events

Real-time updates via Socket.io:

```javascript
// Listen for events
socket.on('stream:status', (data) => { ... })
socket.on('viewer:count', (data) => { ... })
socket.on('chat:message', (data) => { ... })

// Emit events
socket.emit('stream:status', { ... })
socket.emit('viewer:count', { viewers: 100 })
```

## Development

### Running Tests
```bash
npm test
```

### Database Operations
```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run migrate

# Open Prisma Studio
npm run studio
```

### Building for Production
```bash
# Build everything
npm run build

# Build client only
npm run build:client

# Build server only
npm run build:server
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Helmet.js security headers
- CORS configuration
- Input validation
- SQL injection prevention (Prisma)
- Rate limiting ready

## Environment Variables

Required:
- `JWT_SECRET` - Secret key for JWT tokens
- `DATABASE_URL` - PostgreSQL connection string

Optional AI Services:
- `OPENROUTER_API_KEY` - For AI chat
- `HEYGEN_API_KEY` - For video generation
- `ELEVENLABS_API_KEY` - For voice synthesis
- `WISPRFLOW_API_KEY` - For transcription

Streaming (optional):
- `YOUTUBE_STREAM_KEY`
- `TWITCH_STREAM_KEY`
- `KICK_STREAM_KEY`

## Contributing

This is a production project by SwanyThree & Domino Entertainment Ent.

## License

MIT License - See LICENSE file for details

## Support

For issues and support, please open an issue on GitHub.

---

**Built with ❤️ by SwanyThree & Domino Entertainment Ent.**