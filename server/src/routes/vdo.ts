import { Router, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { randomBytes } from 'crypto';

const router = Router();

router.use(authenticate);

// Store VDO rooms (in production, use database)
const vdoRooms = new Map<string, {
  roomId: string;
  pushUrl: string;
  viewUrl: string;
  createdAt: Date;
  userId: string;
}>();

// Create VDO.Ninja room
router.post('/create-room', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // Generate unique room ID
    const roomId = randomBytes(8).toString('hex');

    const room = {
      roomId,
      pushUrl: `https://vdo.ninja/?push=${roomId}`,
      viewUrl: `https://vdo.ninja/?view=${roomId}&scene`,
      createdAt: new Date(),
      userId,
    };

    vdoRooms.set(roomId, room);

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's rooms
router.get('/rooms', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRooms = Array.from(vdoRooms.values()).filter(room => room.userId === userId);

    res.json({
      success: true,
      data: userRooms,
    });
  } catch (error) {
    next(error);
  }
});

// Get room details
router.get('/rooms/:roomId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params;
    const room = vdoRooms.get(roomId);

    if (!room || room.userId !== req.user!.id) {
      throw createError('Room not found', 404);
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
