import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
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

// Import middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL || 'http://localhost:5173'
      : 'http://localhost:5173',
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'http://localhost:5173'
    : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
}

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('stream:status', (data) => {
    io.emit('stream:status', data);
  });

  socket.on('viewer:count', (data) => {
    io.emit('viewer:count', data);
  });

  socket.on('chat:message', (data) => {
    io.emit('chat:message', data);
  });
});

// Make io accessible to routes
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// Error handler (must be last)
app.use(errorHandler);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 T-Smooth Productions Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket server ready`);
});

export { io };
