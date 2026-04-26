import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get all notes
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
});

// Create note
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      throw createError('Title and content are required', 400);
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        tags: tags || [],
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
});

// Update note
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    const allowedFields = ['title', 'content', 'tags'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const result = await prisma.note.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: updateData,
    });

    if (result.count === 0) {
      throw createError('Note not found', 404);
    }

    const updated = await prisma.note.findUnique({
      where: { id },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Delete note
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await prisma.note.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (result.count === 0) {
      throw createError('Note not found', 404);
    }

    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
