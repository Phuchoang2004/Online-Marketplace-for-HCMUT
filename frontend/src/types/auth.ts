export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  // FE 7: FE7 - Vendor Register, Admin Confirm
  //role: 'admin' | 'user';
  role: 'customer' | 'vendor' | 'staff' | 'admin';
  // FE7 - Vendor Register, Admin Confirm
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}