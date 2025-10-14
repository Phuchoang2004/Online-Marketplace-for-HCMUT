import { apiClient } from './api';
import { LoginCredentials, AuthResponse, User } from '@/types/auth';
import Cookies from 'js-cookie';

function decodeJwt<T = any>(token: string): T | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json))) as T;
  } catch {
    return null;
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Backend returns { token }
    const res = await apiClient.postRaw<{ token: string }>('/login', credentials);
    if (!res?.token) throw new Error('Invalid login response');

    Cookies.set('auth_token', res.token, { expires: 7 });

    // Build user from JWT payload
    const payload = decodeJwt<{ fullName: string; email: string; role: string; id: string }>(res.token);
    if (!payload?.email) throw new Error('Invalid token payload');

    const user: User = {
      id: payload.id,
      email: payload.email,
      name: payload.fullName || payload.email,
      role: payload.role?.toLowerCase() === 'admin' ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user,
      token: res.token,
      refreshToken: '',
    };
  },

  async register(input: { fullName: string; email: string; password: string }): Promise<{ success: boolean; message: string }>{
    const res = await apiClient.postRaw<{ success: boolean; message: string }>('/register', input);
    return res;
  },

  async getCurrentUser(): Promise<User> {
    const token = Cookies.get('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const payload = decodeJwt<{ fullName: string; email: string; role: string; id: string }>(token);
    if (!payload?.email) throw new Error('Invalid token');

    return {
      id: payload.id,
      email: payload.email,
      name: payload.fullName || payload.email,
      role: payload.role?.toLowerCase() === 'admin' ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async refreshToken(): Promise<AuthResponse> {
    const token = Cookies.get('auth_token');
    if (!token) throw new Error('No auth token found');
    const user = await this.getCurrentUser();
    return { user, token, refreshToken: '' };
  },

  logout(): void {
    Cookies.remove('auth_token');
    Cookies.remove('refresh_token');
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('auth_token');
  },
};