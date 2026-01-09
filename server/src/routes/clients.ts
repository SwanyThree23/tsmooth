import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get all clients
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    next(error);
  }
});

// Get single client
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!client) {
      throw createError('Client not found', 404);
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    next(error);
  }
});

// Create client
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, company, industry, totalPaid, projectCount } = req.body;

    if (!name || !email) {
      throw createError('Name and email are required', 400);
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        company,
        industry,
        totalPaid: totalPaid ? parseFloat(totalPaid) : 0,
        projectCount: projectCount ? parseInt(projectCount) : 0,
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    next(error);
  }
});

// Update client
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    const allowedFields = ['name', 'email', 'phone', 'company', 'industry', 'totalPaid', 'projectCount'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'totalPaid') {
          updateData[field] = parseFloat(req.body[field]);
        } else if (field === 'projectCount') {
          updateData[field] = parseInt(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const result = await prisma.client.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: updateData,
    });

    if (result.count === 0) {
      throw createError('Client not found', 404);
    }

    const updated = await prisma.client.findUnique({
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

// Delete client
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await prisma.client.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (result.count === 0) {
      throw createError('Client not found', 404);
    }

    res.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
