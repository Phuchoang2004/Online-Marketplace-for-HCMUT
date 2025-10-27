/*
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
*/

// API Mock
import { apiClient } from './api';
import { LoginCredentials, AuthResponse, User } from '@/types/auth';
import Cookies from 'js-cookie';

// --- MOCK ---
// THÊM MỚI
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// THÊM MỚI
const mockApiCall = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 500); // Delay 500ms
  });
};

/**
 * THÊM MỚI: Tạo một token JWT giả (URL-safe)
 * để tương thích với hàm decodeJwt thật.
 */
function createFakeToken(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const b64UrlEncode = (str: string) => {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };
  const encodedHeader = b64UrlEncode(JSON.stringify(header));
  const encodedPayload = b64UrlEncode(JSON.stringify(payload));
  return `${encodedHeader}.${encodedPayload}.fakeSignature`;
}
// --- MOCK ---

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
    // --- MOCK ---
    if (USE_MOCKS) {
      console.warn('ĐANG SỬ DỤNG MOCK DATA CHO: authService.login');

      // THÊM MỚI: Account admin
      if (
        credentials.email === 'admin@example.com' &&
        credentials.password === 'admin123'
      ) {
        const adminUser: User = {
          id: 'admin-id-123',
          email: 'admin@example.com',
          name: 'Admin User (Mock)',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const token = createFakeToken(adminUser);
        Cookies.set('auth_token', token, { expires: 7 });
        return mockApiCall({ user: adminUser, token, refreshToken: '' });
      }

      // THÊM MỚI: Account customer
      if (
        credentials.email === 'customer@example.com' &&
        credentials.password === 'customer123'
      ) {
        const customerUser: User = {
          id: 'customer-id-456',
          email: 'customer@example.com',
          name: 'Customer User (Mock)',
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const token = createFakeToken(customerUser);
        Cookies.set('auth_token', token, { expires: 7 });
        return mockApiCall({ user: customerUser, token, refreshToken: '' });
      }
      
      // THÊM MỚI: Account vendor
      if (
        credentials.email === 'vendor@example.com' &&
        credentials.password === 'vendor123'
      ) {
        const vendorUser: User = {
          id: 'vendor-id-789',
          email: 'vendor@example.com',
          name: 'Vendor User (Mock)',
          role: 'vendor', 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const token = createFakeToken(vendorUser);
        Cookies.set('auth_token', token, { expires: 7 });
        return mockApiCall({ user: vendorUser, token, refreshToken: '' });
      }
      // THÊM MỚI: Other account (lỗi)
      throw new Error('Invalid email or password (mock)');
    }
    // --- MOCK ---

    // --- GIỮ NGUYÊN ---
    // USE_MOCKS=false
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
    // --- MOCK ---
    if (USE_MOCKS) {
      console.warn('ĐANG SỬ DỤNG MOCK DATA CHO: authService.register');
      return mockApiCall({
        success: true,
        message: 'Đăng ký giả lập thành công!',
      });
    }
    // --- MOCK ---

    // GIỮ NGUYÊN
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