import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get all invoices
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
});

// Create invoice
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { invoiceNumber, client, project, amount, status, dueDate } = req.body;

    if (!invoiceNumber || !client || amount === undefined || !status || !dueDate) {
      throw createError('Missing required fields', 400);
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        client,
        project,
        amount: parseFloat(amount),
        status,
        dueDate: new Date(dueDate),
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
});

// Update invoice
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    const allowedFields = ['invoiceNumber', 'client', 'project', 'amount', 'status', 'dueDate'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'amount') {
          updateData[field] = parseFloat(req.body[field]);
        } else if (field === 'dueDate') {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const result = await prisma.invoice.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: updateData,
    });

    if (result.count === 0) {
      throw createError('Invoice not found', 404);
    }

    const updated = await prisma.invoice.findUnique({
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

// Delete invoice
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await prisma.invoice.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (result.count === 0) {
      throw createError('Invoice not found', 404);
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
