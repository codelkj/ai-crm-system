/**
 * Authentication Types
 */

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'user';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface RegisterDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}
