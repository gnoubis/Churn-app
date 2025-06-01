export type UserRole = 'admin' | 'data_scientist' | 'marketing_manager';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface JWTResponse {
  refresh: string;
  access: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
} 