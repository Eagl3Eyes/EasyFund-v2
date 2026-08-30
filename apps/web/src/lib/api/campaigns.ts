import { api } from './client';
import type { Campaign, CampaignFilters, ApiResponse } from '../types';

export async function getCampaigns(filters?: CampaignFilters): Promise<ApiResponse<Campaign[]>> {
  return api.get('/campaigns', { params: filters as Record<string, string | number | boolean | undefined> });
}

export async function getCampaignBySlug(slug: string): Promise<ApiResponse<Campaign>> {
  return api.get(`/campaigns/${slug}`);
}

export async function getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
  return api.get(`/campaigns/id/${id}`);
}

export async function getFeaturedCampaigns(): Promise<ApiResponse<Campaign[]>> {
  return api.get('/campaigns/featured');
}

export async function getTrendingCampaigns(): Promise<ApiResponse<Campaign[]>> {
  return api.get('/campaigns/trending');
}

export async function getEndingSoonCampaigns(): Promise<ApiResponse<Campaign[]>> {
  return api.get('/campaigns/ending-soon');
}

export async function getAlmostFundedCampaigns(): Promise<ApiResponse<Campaign[]>> {
  return api.get('/campaigns/almost-funded');
}

export async function createCampaign(data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
  return api.post('/campaigns', data);
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
  return api.patch(`/campaigns/${id}`, data);
}

export async function deleteCampaign(id: string): Promise<ApiResponse<null>> {
  return api.delete(`/campaigns/${id}`);
}

export async function saveCampaign(id: string): Promise<ApiResponse<null>> {
  return api.post(`/campaigns/${id}/save`);
}

export async function unsaveCampaign(id: string): Promise<ApiResponse<null>> {
  return api.delete(`/campaigns/${id}/save`);
}

export async function getSavedCampaigns(): Promise<ApiResponse<Campaign[]>> {
  return api.get('/campaigns/saved');
}
