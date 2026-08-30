import { WithdrawalRepository, type WithdrawalDocument } from '../repositories/withdrawal.repository';
import { CampaignRepository } from '../repositories/campaign.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { paginate, type PaginationOptions } from '../utils/paginate';

export class WithdrawalService {
  private withdrawalRepo = new WithdrawalRepository();
  private campaignRepo = new CampaignRepository();

  async getById(id: string): Promise<WithdrawalDocument> {
    const withdrawal = await this.withdrawalRepo.findById(id);
    if (!withdrawal) throw new NotFoundError('Withdrawal not found');
    return withdrawal;
  }

  async getByFundraiser(fundraiserId: string, options?: PaginationOptions) {
    return this.withdrawalRepo.findByFundraiser(fundraiserId, options);
  }

  async getAvailableBalance(fundraiserId: string): Promise<number> {
    return this.withdrawalRepo.getAvailableBalance(fundraiserId);
  }

  async create(data: {
    campaignId: string;
    amount: number;
    bankName: string;
    accountHolder?: string;
    accountNumber: string;
    routingNumber?: string;
    iban?: string;
    swiftCode?: string;
    fundraiserId: string;
    fundraiserName: string;
  }): Promise<WithdrawalDocument> {
    const campaign = await this.campaignRepo.findById(data.campaignId);
    if (!campaign) throw new NotFoundError('Campaign not found');
    if (campaign.fundraiserId !== data.fundraiserId) throw new ForbiddenError('Not your campaign');

    const availableBalance = await this.getAvailableBalance(data.fundraiserId);
    if (data.amount > availableBalance) {
      throw new BadRequestError(`Insufficient balance. Available: $${availableBalance.toFixed(2)}`);
    }

    const fees = Math.round(data.amount * 0.02 * 100) / 100;
    const netAmount = data.amount - fees;

    const withdrawal = await this.withdrawalRepo.create({
      fundraiserId: data.fundraiserId,
      fundraiserName: data.fundraiserName,
      campaignId: data.campaignId,
      campaignTitle: campaign.title,
      amount: data.amount,
      fees,
      netAmount,
      currency: 'usd',
      status: 'requested',
      bankDetails: {
        accountHolder: data.accountHolder || data.fundraiserName,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        routingNumber: data.routingNumber,
        iban: data.iban,
        swiftCode: data.swiftCode,
      },
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);

    return withdrawal;
  }

  async cancel(withdrawalId: string, fundraiserId: string): Promise<WithdrawalDocument> {
    const withdrawal = await this.withdrawalRepo.findById(withdrawalId);
    if (!withdrawal) throw new NotFoundError('Withdrawal not found');
    if (withdrawal.fundraiserId !== fundraiserId) throw new ForbiddenError('Not your withdrawal');
    if (withdrawal.status !== 'requested' && withdrawal.status !== 'risk_check') {
      throw new BadRequestError('Cannot cancel withdrawal in current status');
    }

    const updated = await this.withdrawalRepo.updateStatus(withdrawalId, 'cancelled');
    return updated!;
  }

  async getTotalWithdrawn(fundraiserId: string): Promise<number> {
    return this.withdrawalRepo.getTotalWithdrawnByFundraiser(fundraiserId);
  }
}

export const withdrawalService = new WithdrawalService();
