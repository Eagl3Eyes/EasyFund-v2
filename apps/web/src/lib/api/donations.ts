import { api } from './client';
import type { Donation, ApiResponse } from '../types';

export async function createDonation(data: {
  campaignId: string;
  amount: number;
  anonymous?: boolean;
  message?: string;
}): Promise<ApiResponse<{ clientSecret: string; donationId: string }>> {
  return api.post('/donations', data);
}

export async function confirmDonation(donationId: string): Promise<ApiResponse<Donation>> {
  return api.post(`/donations/${donationId}/confirm`);
}

export async function getDonationsByUser(email: string): Promise<ApiResponse<Donation[]>> {
  return api.get(`/donations/user/${email}`);
}

export async function getDonationsByCampaign(campaignId: string): Promise<ApiResponse<Donation[]>> {
  return api.get(`/donations/campaign/${campaignId}`);
}

export async function getDonationHistory(email: string): Promise<ApiResponse<Donation[]>> {
  return api.get(`/donations/history/${email}`);
}
