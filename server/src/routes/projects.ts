import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// Get all projects
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
});

// Get single project
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!project) {
      throw createError('Project not found', 404);
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// Create project
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      client,
      status,
      priority,
      budget,
      progress,
      deadline,
      description,
      tags,
    } = req.body;

    if (!name || !client || !status || !priority || budget === undefined || progress === undefined || !deadline) {
      throw createError('Missing required fields', 400);
    }

    const project = await prisma.project.create({
      data: {
        name,
        client,
        status,
        priority,
        budget: parseFloat(budget),
        progress: parseInt(progress),
        deadline: new Date(deadline),
        description,
        tags: tags || [],
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// Update project
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    // Only include fields that are provided
    const allowedFields = ['name', 'client', 'status', 'priority', 'budget', 'progress', 'deadline', 'description', 'tags'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'budget') {
          updateData[field] = parseFloat(req.body[field]);
        } else if (field === 'progress') {
          updateData[field] = parseInt(req.body[field]);
        } else if (field === 'deadline') {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const project = await prisma.project.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: updateData,
    });

    if (project.count === 0) {
      throw createError('Project not found', 404);
    }

    const updated = await prisma.project.findUnique({
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

// Delete project
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await prisma.project.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (result.count === 0) {
      throw createError('Project not found', 404);
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
