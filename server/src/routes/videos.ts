import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get all videos
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const videos = await prisma.video.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
});

// Create video
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, embedUrl, thumbnail, source, category, tags } = req.body;

    if (!title || !embedUrl) {
      throw createError('Title and embedUrl are required', 400);
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        embedUrl,
        thumbnail,
        source,
        category,
        tags: tags || [],
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
});

// Update video
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    const allowedFields = ['title', 'description', 'embedUrl', 'thumbnail', 'source', 'category', 'tags', 'views'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'views') {
          updateData[field] = parseInt(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const result = await prisma.video.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: updateData,
    });

    if (result.count === 0) {
      throw createError('Video not found', 404);
    }

    const updated = await prisma.video.findUnique({
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

// Increment view count
router.post('/:id/view', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!video) {
      throw createError('Video not found', 404);
    }

    const updated = await prisma.video.update({
      where: { id },
      data: {
        views: video.views + 1,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Delete video
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await prisma.video.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (result.count === 0) {
      throw createError('Video not found', 404);
    }

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
