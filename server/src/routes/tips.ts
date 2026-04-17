import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw createError('Stripe not configured', 500);
  return new Stripe(key, { apiVersion: '2023-10-16' });
};

// Create Stripe Connect onboarding link
router.post('/connect/onboard', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stripe = getStripe();
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw createError('User not found', 404);

    let accountId = user.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: { transfers: { requested: true } },
      });
      accountId = account.id;
      await prisma.user.update({ where: { id: userId }, data: { stripeAccountId: accountId } });
    }

    const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tips?connected=1`;
    const refreshUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tips?refresh=1`;

    const link = await stripe.accountLinks.create({
      account: accountId,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type: 'account_onboarding',
    });

    res.json({ success: true, data: { url: link.url } });
  } catch (error) {
    next(error);
  }
});

// Get Connect account status
router.get('/connect/status', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.stripeAccountId) {
      return res.json({ success: true, data: { connected: false } });
    }

    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    res.json({
      success: true,
      data: {
        connected: true,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        accountId: user.stripeAccountId,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create payment intent for tip (90% to creator, 10% platform)
router.post('/create-payment-intent', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, receiverId, message } = req.body;
    if (!amount || !receiverId) throw createError('Amount and receiverId required', 400);

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (amountCents < 50) throw createError('Minimum tip is $0.50', 400);

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver?.stripeAccountId) throw createError('Creator not connected to Stripe', 400);

    const stripe = getStripe();
    const platformFeePercent = parseInt(process.env.STRIPE_PLATFORM_FEE_PERCENT || '10');
    const platformFeeCents = Math.round(amountCents * (platformFeePercent / 100));

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      application_fee_amount: platformFeeCents,
      transfer_data: { destination: receiver.stripeAccountId },
      metadata: {
        senderId: req.user!.id,
        receiverId,
        message: message || '',
      },
    });

    // Create pending tip record
    const tip = await prisma.tip.create({
      data: {
        amount: amountCents / 100,
        currency: 'usd',
        message,
        stripePaymentId: paymentIntent.id,
        status: 'pending',
        senderId: req.user!.id,
        receiverId,
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        tipId: tip.id,
        platformFee: platformFeeCents / 100,
        creatorAmount: (amountCents - platformFeeCents) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Stripe webhook for payment confirmation
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    await prisma.tip.updateMany({
      where: { stripePaymentId: pi.id },
      data: { status: 'completed' },
    });

    // Broadcast via socket
    const io = (req.app as any).get('io');
    if (io) {
      io.emit('tip:received', {
        amount: pi.amount / 100,
        receiverId: pi.metadata.receiverId,
        message: pi.metadata.message,
      });
    }
  }

  res.json({ received: true });
});

// Get leaderboard
router.get('/leaderboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topTippers = await prisma.tip.groupBy({
      by: ['senderId'],
      where: { status: 'completed' },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 20,
    });

    const results = await Promise.all(
      topTippers.map(async (entry) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.senderId },
          select: { id: true, name: true, avatar: true },
        });
        return {
          user,
          totalTipped: entry._sum.amount || 0,
          tipCount: entry._count.id,
        };
      })
    );

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

// Get user's tip history
router.get('/history', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tips = await prisma.tip.findMany({
      where: {
        OR: [{ senderId: req.user!.id }, { receiverId: req.user!.id }],
        status: 'completed',
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: tips });
  } catch (error) {
    next(error);
  }
});

export default router;
