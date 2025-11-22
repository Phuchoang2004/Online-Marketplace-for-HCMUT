import { apiClient } from './api';
import { LoginCredentials, AuthResponse, User } from '@/types/auth';
import Cookies from 'js-cookie';

// GIỮ NGUYÊN
function decodeJwt<T = any>(token: string): T | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json))) as T;
  } catch {
    return null;
  }
}

// GIỮ NGUYÊN
export const authService = {
  // GIỮ NGUYÊN
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await apiClient.postRaw<{ token: string }>('/login', credentials);
    if (!res?.token) throw new Error('Invalid login response');

    Cookies.set('auth_token', res.token, { expires: 7 });

    const payload = decodeJwt<{ fullName: string; email: string; role: string; id: string }>(res.token);
    if (!payload?.email) throw new Error('Invalid token payload');

    const user: User = {
      id: payload.id,
      email: payload.email,
      name: payload.fullName || payload.email,
      // SỬA ĐỔI: Sửa lại logic gán 'role' để khớp với types mới
      role: (payload.role?.toLowerCase() as User['role']) || 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user,
      token: res.token,
      refreshToken: '',
    };
  },

  // GIỮ NGUYÊN: Hàm register
  async register(input: { fullName: string; email: string; password: string }): Promise<{ success: boolean; message: string }>{
    const res = await apiClient.postRaw<{ success: boolean; message: string }>('/register', input);
    return res;
  },

  // GIỮ NGUYÊN
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
      // SỬA ĐỔI: Sửa lại logic gán 'role' để khớp với types mới
      role: (payload.role?.toLowerCase() as User['role']) || 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  // GIỮ NGUYÊN
  async refreshToken(): Promise<AuthResponse> {
    const token = Cookies.get('auth_token');
    if (!token) throw new Error('No auth token found');
    const user = await this.getCurrentUser();
    return { user, token, refreshToken: '' };
  },

  // GIỮ NGUYÊN
  logout(): void {
    Cookies.remove('auth_token');
    Cookies.remove('refresh_token');
  },

  // GIỮ NGUYÊN
  isAuthenticated(): boolean {
    return !!Cookies.get('auth_token');
  },
};