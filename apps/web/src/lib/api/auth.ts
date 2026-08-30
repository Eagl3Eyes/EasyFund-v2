import { api } from './client';
import type { User, ApiResponse } from '../types';

export async function login(email: string, _password: string): Promise<ApiResponse<{ user: User; token: string }>> {
  // Firebase handles auth; this endpoint creates/finds the backend user and sets session
  return api.post('/auth/login', { email });
}

export async function register(data: {
  name: string;
  email: string;
  photoURL?: string;
}): Promise<ApiResponse<{ user: User }>> {
  return api.post('/auth/register', data);
}

export async function logout(): Promise<ApiResponse<null>> {
  return api.post('/auth/logout');
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return api.get('/auth/me');
}

export async function updateUserProfile(data: {
  name?: string;
  bio?: string;
  location?: string;
  image?: string;
}): Promise<ApiResponse<User>> {
  return api.patch('/auth/profile', data);
}
