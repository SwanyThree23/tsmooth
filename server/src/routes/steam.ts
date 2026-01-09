import { Router, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Store Steam Deck state (in production, use database or Redis)
const steamState = new Map<string, {
  connected: boolean;
  currentGame?: string;
  fps?: number;
  temperature?: number;
  battery?: number;
  streaming: boolean;
}>();

// Mock game library
const mockGames = [
  { id: 1, name: 'Elden Ring', playtime: 125 },
  { id: 2, name: 'Baldur\'s Gate 3', playtime: 87 },
  { id: 3, name: 'Hades', playtime: 45 },
  { id: 4, name: 'Cyberpunk 2077', playtime: 92 },
  { id: 5, name: 'The Witcher 3', playtime: 156 },
];

// Connect Steam Deck
router.post('/connect', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const state = {
      connected: true,
      fps: 60,
      temperature: 65,
      battery: 87,
      streaming: false,
    };

    steamState.set(userId, state);

    res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    next(error);
  }
});

// Disconnect Steam Deck
router.post('/disconnect', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const state = {
      connected: false,
      streaming: false,
    };

    steamState.set(userId, state);

    res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    next(error);
  }
});

// Get Steam Deck status
router.get('/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const status = steamState.get(userId) || {
      connected: false,
      streaming: false,
    };

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

// Get game library
router.get('/games', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: mockGames,
    });
  } catch (error) {
    next(error);
  }
});

// Start game streaming
router.post('/stream/start', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { gameId } = req.body;
    const userId = req.user!.id;

    const state = steamState.get(userId);
    if (!state || !state.connected) {
      throw createError('Steam Deck not connected', 400);
    }

    const game = mockGames.find(g => g.id === parseInt(gameId));
    if (!game) {
      throw createError('Game not found', 404);
    }

    state.streaming = true;
    state.currentGame = game.name;
    steamState.set(userId, state);

    res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    next(error);
  }
});

// Stop game streaming
router.post('/stream/stop', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const state = steamState.get(userId);
    if (state) {
      state.streaming = false;
      state.currentGame = undefined;
      steamState.set(userId, state);
    }

    res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    next(error);
  }
});

// Update performance metrics
router.post('/metrics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fps, temperature, battery } = req.body;
    const userId = req.user!.id;

    const state = steamState.get(userId);
    if (state) {
      if (fps !== undefined) state.fps = fps;
      if (temperature !== undefined) state.temperature = temperature;
      if (battery !== undefined) state.battery = battery;
      steamState.set(userId, state);
    }

    res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
