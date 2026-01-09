import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get all tasks
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

// Create task
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, priority, status, dueDate, completed } = req.body;

    if (!title || !priority || !status) {
      throw createError('Title, priority, and status are required', 400);
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        completed: completed || false,
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// Update task
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    const allowedFields = ['title', 'description', 'priority', 'status', 'dueDate', 'completed'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'dueDate' && req.body[field]) {
          updateData[field] = new Date(req.body[field]);
        } else if (field === 'completed') {
          updateData[field] = Boolean(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const result = await prisma.task.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: updateData,
    });

    if (result.count === 0) {
      throw createError('Task not found', 404);
    }

    const updated = await prisma.task.findUnique({
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

// Delete task
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await prisma.task.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (result.count === 0) {
      throw createError('Task not found', 404);
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
