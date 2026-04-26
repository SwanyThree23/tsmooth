import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get chat history for a room
router.get('/:roomId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const cursor = req.query.cursor as string;

    const messages = await prisma.chatMessage.findMany({
      where: {
        roomId,
        deleted: false,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    next(error);
  }
});

// Send a message
router.post('/:roomId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params;
    const { content, messageType } = req.body;

    if (!content?.trim()) throw createError('Message cannot be empty', 400);
    if (content.length > 500) throw createError('Message too long (max 500 chars)', 400);

    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        content: content.trim(),
        messageType: messageType || 'text',
        userId: req.user!.id,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Broadcast to room via socket
    const io = (req.app as any).get('io');
    io?.to(roomId).emit('chat:message', message);

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

// Delete message (author or admin)
router.delete('/:roomId/:messageId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { messageId } = req.params;

    const msg = await prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!msg) throw createError('Message not found', 404);

    const isAuthor = msg.userId === req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    if (!isAuthor && !isAdmin) throw createError('Not authorized', 403);

    await prisma.chatMessage.update({ where: { id: messageId }, data: { deleted: true } });

    const io = (req.app as any).get('io');
    io?.to(req.params.roomId).emit('chat:deleted', { messageId });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get rooms the user has chatted in
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rooms = await prisma.chatMessage.groupBy({
      by: ['roomId'],
      where: { userId: req.user!.id },
      _max: { createdAt: true },
      _count: { id: true },
      orderBy: { _max: { createdAt: 'desc' } },
    });

    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
});

export default router;
