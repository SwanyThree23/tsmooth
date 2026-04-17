import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import clientRoutes from './routes/clients';
import invoiceRoutes from './routes/invoices';
import videoRoutes from './routes/videos';
import taskRoutes from './routes/tasks';
import noteRoutes from './routes/notes';
import aiRoutes from './routes/ai';
import podcastRoutes from './routes/podcast';
import streamingRoutes from './routes/streaming';
import vdoRoutes from './routes/vdo';
import steamRoutes from './routes/steam';
import tipsRoutes from './routes/tips';
import watchPartyRoutes from './routes/watchparty';
import chatRoutes from './routes/chat';

import { errorHandler } from './middleware/errorHandler';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(limiter);
// Raw body for Stripe webhooks
app.use('/api/tips/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
}
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join a room (watch party or chat room)
  socket.on('room:join', (roomId: string) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room: ${roomId}`);
  });

  socket.on('room:leave', (roomId: string) => {
    socket.leave(roomId);
  });

  // Watch party events
  socket.on('party:sync', (data) => {
    socket.to(data.roomCode).emit('party:sync', data);
  });

  // Chat events
  socket.on('chat:typing', (data) => {
    socket.to(data.roomId).emit('chat:typing', { userId: data.userId, name: data.name });
  });

  // Streaming events
  socket.on('stream:status', (data) => { io.emit('stream:status', data); });
  socket.on('viewer:count', (data) => { io.emit('viewer:count', data); });

  // Tip events - broadcast to room
  socket.on('tip:sent', (data) => {
    if (data.roomId) socket.to(data.roomId).emit('tip:received', data);
    else io.emit('tip:received', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/podcast', podcastRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/vdo', vdoRoutes);
app.use('/api/steam', steamRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/watchparty', watchPartyRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' });
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`🚀 T-Smooth Productions Server v2.0 on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket + LiveKit + Stripe ready`);
});

export { io };
