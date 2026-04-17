import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AccessToken } from 'livekit-server-sdk';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { randomBytes } from 'crypto';

const router = Router();
const prisma = new PrismaClient();

function generateRoomCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

function getLiveKitToken(roomName: string, participantName: string, isHost: boolean): string {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw createError('LiveKit not configured', 500);
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    name: participantName,
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: isHost,
    canSubscribe: true,
    canPublishData: true,
  });

  return at.toJwt() as unknown as string;
}

// Create watch party
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, videoUrl, maxMembers } = req.body;
    if (!title || !videoUrl) throw createError('Title and videoUrl required', 400);

    const roomCode = generateRoomCode();

    const party = await prisma.watchParty.create({
      data: {
        title,
        hostId: req.user!.id,
        videoUrl,
        roomCode,
        maxMembers: maxMembers || 20,
        isLive: false,
      },
    });

    // Add host as first member
    const token = getLiveKitToken(roomCode, req.user!.email, true);
    await prisma.watchPartyMember.create({
      data: {
        watchPartyId: party.id,
        userId: req.user!.id,
        role: 'host',
        liveKitToken: token,
      },
    });

    res.status(201).json({
      success: true,
      data: { ...party, liveKitToken: token, liveKitUrl: process.env.LIVEKIT_URL },
    });
  } catch (error) {
    next(error);
  }
});

// List watch parties
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parties = await prisma.watchParty.findMany({
      where: { isLive: true },
      include: {
        members: { select: { userId: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: parties });
  } catch (error) {
    next(error);
  }
});

// Get watch party by room code
router.get('/:roomCode', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const party = await prisma.watchParty.findUnique({
      where: { roomCode: req.params.roomCode },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!party) throw createError('Watch party not found', 404);

    res.json({ success: true, data: party });
  } catch (error) {
    next(error);
  }
});

// Join watch party
router.post('/:roomCode/join', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const party = await prisma.watchParty.findUnique({
      where: { roomCode: req.params.roomCode },
      include: { members: true },
    });

    if (!party) throw createError('Watch party not found', 404);
    if (party.members.length >= party.maxMembers) {
      throw createError('Watch party is full', 400);
    }

    const existing = party.members.find(m => m.userId === req.user!.id);
    if (existing) {
      // Re-generate token for existing member
      const token = getLiveKitToken(party.roomCode, req.user!.email, existing.role === 'host');
      return res.json({ success: true, data: { ...party, liveKitToken: token, liveKitUrl: process.env.LIVEKIT_URL } });
    }

    const token = getLiveKitToken(party.roomCode, req.user!.email, false);
    await prisma.watchPartyMember.create({
      data: {
        watchPartyId: party.id,
        userId: req.user!.id,
        role: 'viewer',
        liveKitToken: token,
      },
    });

    // Notify via socket
    const io = (req.app as any).get('io');
    io?.to(party.roomCode).emit('party:member-joined', {
      userId: req.user!.id,
      name: req.user!.email,
    });

    res.json({ success: true, data: { ...party, liveKitToken: token, liveKitUrl: process.env.LIVEKIT_URL } });
  } catch (error) {
    next(error);
  }
});

// Sync video state (host only)
router.post('/:roomCode/sync', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { playing, currentTime, videoUrl } = req.body;
    const party = await prisma.watchParty.findUnique({ where: { roomCode: req.params.roomCode } });
    if (!party) throw createError('Watch party not found', 404);
    if (party.hostId !== req.user!.id) throw createError('Only the host can sync', 403);

    const videoState = { playing, currentTime, videoUrl: videoUrl || party.videoUrl, updatedAt: Date.now() };

    await prisma.watchParty.update({
      where: { id: party.id },
      data: { videoState, videoUrl: videoUrl || party.videoUrl },
    });

    const io = (req.app as any).get('io');
    io?.to(party.roomCode).emit('party:sync', videoState);

    res.json({ success: true, data: videoState });
  } catch (error) {
    next(error);
  }
});

// Update party live status
router.post('/:roomCode/live', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isLive } = req.body;
    const party = await prisma.watchParty.findUnique({ where: { roomCode: req.params.roomCode } });
    if (!party) throw createError('Watch party not found', 404);
    if (party.hostId !== req.user!.id) throw createError('Only the host can control this', 403);

    await prisma.watchParty.update({ where: { id: party.id }, data: { isLive } });

    const io = (req.app as any).get('io');
    io?.to(party.roomCode).emit('party:status', { isLive });

    res.json({ success: true, data: { isLive } });
  } catch (error) {
    next(error);
  }
});

// Promote viewer to panelist
router.post('/:roomCode/promote/:userId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const party = await prisma.watchParty.findUnique({ where: { roomCode: req.params.roomCode } });
    if (!party) throw createError('Party not found', 404);
    if (party.hostId !== req.user!.id) throw createError('Only host can promote', 403);

    await prisma.watchPartyMember.updateMany({
      where: { watchPartyId: party.id, userId: req.params.userId },
      data: { role: 'panelist' },
    });

    const io = (req.app as any).get('io');
    io?.to(party.roomCode).emit('party:promoted', { userId: req.params.userId });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Remove member (moderation)
router.delete('/:roomCode/members/:userId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const party = await prisma.watchParty.findUnique({ where: { roomCode: req.params.roomCode } });
    if (!party) throw createError('Party not found', 404);
    if (party.hostId !== req.user!.id) throw createError('Only host can remove members', 403);

    await prisma.watchPartyMember.deleteMany({
      where: { watchPartyId: party.id, userId: req.params.userId },
    });

    const io = (req.app as any).get('io');
    io?.to(party.roomCode).emit('party:kicked', { userId: req.params.userId });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
