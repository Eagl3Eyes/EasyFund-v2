import { ObjectId } from 'mongodb';
import { DonationRepository, type DonationDocument, type DonationFilters } from '../repositories/donation.repository';
import { CampaignService } from './campaign.service';
import { UserService } from './user.service';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { paginate, type PaginationOptions } from '../utils/paginate';
import { env } from '../config/env';
import { stripe } from '../config/stripe';
import { notificationService } from './notification.service';
import { paymentWebhooks } from '../config/database';
import logger from '../utils/logger';

export class DonationService {
  private donationRepo = new DonationRepository();
  private campaignService = new CampaignService();
  private userService = new UserService();

  async getById(id: string): Promise<DonationDocument> {
    const donation = await this.donationRepo.findById(id);
    if (!donation) throw new NotFoundError('Donation not found');
    return donation;
  }

  async list(filters: DonationFilters, options?: PaginationOptions) {
    return this.donationRepo.findByFilters(filters, options);
  }

  async getByCampaign(campaignId: string, options?: PaginationOptions) {
    return this.donationRepo.findByCampaign(campaignId, options);
  }

  async getByUser(userId: string, options?: PaginationOptions) {
    return this.donationRepo.findByUser(userId, options);
  }

  async getByUserEmail(userEmail: string, options?: PaginationOptions) {
    return this.donationRepo.findByUserEmail(userEmail, options);
  }

  async getRecent(limit = 5): Promise<DonationDocument[]> {
    return this.donationRepo.getRecentDonations(limit);
  }

  async createCheckoutSession(data: {
    campaignId: string;
    amount: number;
    currency?: string;
    anonymous?: boolean;
    message?: string;
    userId: string;
    userName: string;
    userEmail: string;
  }): Promise<{ sessionId: string; sessionUrl: string; donationId: string }> {
    const campaign = await this.campaignService.getById(data.campaignId);

    if (campaign.status !== 'active') {
      throw new BadRequestError('Campaign is not accepting donations');
    }

    const amountInCents = Math.round(data.amount * 100);

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: data.currency || 'usd',
            product_data: {
              name: `Donation to ${campaign.title}`,
              description: data.message || 'Support this campaign',
              images: campaign.image ? [campaign.image] : [],
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${env.FRONTEND_URL}/campaign/${campaign.slug}?donation=success`,
      cancel_url: `${env.FRONTEND_URL}/campaign/${campaign.slug}?donation=cancelled`,
      customer_email: data.userEmail,
      metadata: {
        campaignId: data.campaignId,
        campaignTitle: campaign.title,
        userId: data.userId,
        userName: data.userName,
        anonymous: data.anonymous ? 'true' : 'false',
        message: data.message || '',
      },
    });

    const donation = await this.donationRepo.create({
      campaignId: data.campaignId,
      campaignTitle: campaign.title,
      campaignImage: campaign.image,
      fundraiserName: campaign.fundraiserName,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      amount: data.amount,
      currency: data.currency || 'usd',
      anonymous: data.anonymous || false,
      message: data.message || '',
      status: 'pending',
      transactionId: stripeSession.id,
      stripePaymentIntentId: stripeSession.payment_intent as string || undefined,
      createdAt: new Date().toISOString(),
    });

    return {
      sessionId: stripeSession.id,
      sessionUrl: stripeSession.url || '',
      donationId: donation._id?.toString() || '',
    };
  }

  async handleStripeWebhook(event: any): Promise<void> {
    const existingWebhook = await paymentWebhooks().findOne({ stripeEventId: event.id } as any);
    if (existingWebhook) {
      logger.info({ eventId: event.id }, 'Duplicate webhook event');
      return;
    }

    await paymentWebhooks().insertOne({
      stripeEventId: event.id,
      type: event.type,
      processedAt: new Date().toISOString(),
    } as any);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const donation = await this.donationRepo.findByTransactionId(session.id);
        if (donation && donation.status === 'pending') {
          await this.donationRepo.updateStatus(donation._id!, 'completed');
          await this.campaignService.incrementAmountRaised(donation.campaignId, donation.amount);
          await this.userService.incrementTotalDonated(donation.userId, donation.amount);

          try {
            const campaign = await this.campaignService.getById(donation.campaignId);
            await notificationService.notifyDonationReceived(
              campaign.fundraiserId,
              donation.anonymous ? 'Anonymous' : donation.userName,
              donation.campaignTitle,
              donation.amount
            );
          } catch (error) {
            logger.error({ err: error }, 'Failed to send donation notification');
          }
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        const donation = await this.donationRepo.findByTransactionId(session.id);
        if (donation && donation.status === 'pending') {
          await this.donationRepo.updateStatus(donation._id!, 'failed');
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const donation = await this.donationRepo.findByTransactionId(paymentIntent.id);
        if (donation && donation.status === 'pending') {
          await this.donationRepo.updateStatus(donation._id!, 'failed');
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        const donation = await this.donationRepo.findByStripePaymentIntentId(charge.payment_intent);
        if (donation && donation.status === 'completed') {
          await this.donationRepo.updateStatus(donation._id!, 'refunded');
          await this.campaignService.incrementAmountRaised(donation.campaignId, -donation.amount);
          await this.userService.incrementTotalDonated(donation.userId, -donation.amount);
        }
        break;
      }
      default:
        logger.info({ eventType: event.type }, 'Unhandled webhook event type');
    }
  }

  async getStats() {
    return this.donationRepo.getStats();
  }

  async getMonthlyStats(year: number) {
    return this.donationRepo.getMonthlyStats(year);
  }

  async getTopDonors(limit = 10) {
    return this.donationRepo.getTopDonors(limit);
  }
}
