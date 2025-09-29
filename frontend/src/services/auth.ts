// import { apiClient } from './api'; // Will be used when implementing real API calls
import { LoginCredentials, AuthResponse, User } from '@/types/auth';
import Cookies from 'js-cookie';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mock login for demo purposes - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          email: credentials.email,
          name: 'Admin User',
          avatar: 'https://via.placeholder.com/40',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };
      
      // Store tokens
      Cookies.set('auth_token', mockResponse.token, { expires: 7 });
      Cookies.set('refresh_token', mockResponse.refreshToken, { expires: 30 });
      
      return mockResponse;
    }
    
    throw new Error('Invalid credentials');
  },

  async getCurrentUser(): Promise<User> {
    // Mock current user - replace with actual API call
    const token = Cookies.get('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // In a real app, this would be: return apiClient.get<User>('/auth/me');
    return {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      avatar: 'https://via.placeholder.com/40',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = Cookies.get('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    // In a real app: return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    return this.getCurrentUser().then(user => ({
      user,
      token: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token',
    }));
  },

  logout(): void {
    Cookies.remove('auth_token');
    Cookies.remove('refresh_token');
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('auth_token');
  },
};