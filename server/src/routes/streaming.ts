import { Router, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Store streaming state (in production, use database or Redis)
const streamingState = new Map<string, {
  isStreaming: boolean;
  platforms: {
    youtube: boolean;
    twitch: boolean;
    kick: boolean;
    facebook: boolean;
    linkedin: boolean;
  };
  viewers: number;
  startedAt?: Date;
}>();

// Get streaming status
router.get('/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const status = streamingState.get(userId) || {
      isStreaming: false,
      platforms: {
        youtube: false,
        twitch: false,
        kick: false,
        facebook: false,
        linkedin: false,
      },
      viewers: 0,
    };

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

// Start streaming
router.post('/start', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { platforms } = req.body;

    if (!platforms || Object.keys(platforms).length === 0) {
      throw createError('At least one platform must be selected', 400);
    }

    const userId = req.user!.id;

    const status = {
      isStreaming: true,
      platforms,
      viewers: 0,
      startedAt: new Date(),
    };

    streamingState.set(userId, status);

    // Emit socket event
    const io = req.app.get('io');
    io.emit('stream:status', {
      userId,
      ...status,
    });

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

// Stop streaming
router.post('/stop', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const status = {
      isStreaming: false,
      platforms: {
        youtube: false,
        twitch: false,
        kick: false,
        facebook: false,
        linkedin: false,
      },
      viewers: 0,
    };

    streamingState.set(userId, status);

    // Emit socket event
    const io = req.app.get('io');
    io.emit('stream:status', {
      userId,
      ...status,
    });

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

// Update viewer count
router.post('/viewers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { count } = req.body;
    const userId = req.user!.id;

    const status = streamingState.get(userId);
    if (status) {
      status.viewers = count || 0;
      streamingState.set(userId, status);

      // Emit socket event
      const io = req.app.get('io');
      io.emit('viewer:count', {
        userId,
        viewers: status.viewers,
      });
    }

    res.json({
      success: true,
      data: { viewers: count || 0 },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
