import { Router, type Request, type Response } from 'express';
import { stripe } from '../config/stripe';
import { env } from '../config/env';
import { DonationService } from '../services/donation.service';

const router = Router();
const donationService = new DonationService();

router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    await donationService.handleStripeWebhook(event);
    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export { router as webhookRoutes };
