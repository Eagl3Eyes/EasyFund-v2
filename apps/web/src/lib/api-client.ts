import { getApiUrl } from './config';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl();
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Request failed: ${res.status}`);
    }

    return res.json();
  }

  async get<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(path, { method: 'GET', ...init });
  }

  async post<T>(path: string, body?: unknown, init?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...init,
    });
  }

  async patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...init,
    });
  }

  async delete<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(path, { method: 'DELETE', ...init });
  }

  // Typed convenience methods
  async getCampaigns(params?: { status?: string; fundraiserId?: string; limit?: number; page?: number }) {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.fundraiserId) qs.set('fundraiserId', params.fundraiserId);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.page) qs.set('page', String(params.page));
    const q = qs.toString();
    return this.get(`/api/campaigns${q ? `?${q}` : ''}`);
  }

  async getCampaign(slugOrId: string) {
    return this.get(`/api/campaigns/${slugOrId}`);
  }

  async createCampaign(data: Record<string, unknown>) {
    return this.post('/api/campaigns', data);
  }

  async updateCampaign(id: string, data: Record<string, unknown>) {
    return this.patch(`/api/campaigns/${id}`, data);
  }

  async deleteCampaign(id: string) {
    return this.delete(`/api/campaigns/${id}`);
  }

  async getDonations(path: string) {
    return this.get(path);
  }

  async getAdminStats() {
    return this.get('/api/admin/stats');
  }

  async getAdminCampaigns(limit = 100) {
    return this.get(`/api/admin/campaigns?limit=${limit}`);
  }

  async getAdminUsers(limit = 100) {
    return this.get(`/api/admin/users?limit=${limit}`);
  }

  async getAdminWithdrawals(limit = 100) {
    return this.get(`/api/admin/withdrawals?limit=${limit}`);
  }

  async getAdminReports(limit = 100) {
    return this.get(`/api/admin/reports?limit=${limit}`);
  }

  async getAdminVerification(limit = 100) {
    return this.get(`/api/admin/verification?limit=${limit}`);
  }

  async updateCampaignStatus(id: string, status: string) {
    return this.patch(`/api/admin/campaigns/${id}/status`, { status });
  }

  async updateUserRole(id: string, role: string) {
    return this.patch(`/api/admin/users/${id}/role`, { role });
  }

  async updateWithdrawalStatus(id: string, status: string) {
    return this.patch(`/api/admin/withdrawals/${id}`, { status });
  }

  async resolveReport(id: string, status: string) {
    return this.patch(`/api/admin/reports/${id}`, { status });
  }

  async updateVerificationStatus(id: string, status: string) {
    return this.patch(`/api/admin/verification/${id}`, { status });
  }

  async getMe() {
    return this.get('/api/auth/me');
  }

  async getSavedCampaigns(limit?: number) {
    const q = limit ? `?limit=${limit}` : '';
    return this.get(`/api/users/saved/campaigns${q}`);
  }

  async getNotifications(limit?: number) {
    const q = limit ? `?limit=${limit}` : '';
    return this.get(`/api/notifications${q}`);
  }

  async markNotificationsRead() {
    return this.patch('/api/notifications/read-all');
  }
}

export const api = new ApiClient();
