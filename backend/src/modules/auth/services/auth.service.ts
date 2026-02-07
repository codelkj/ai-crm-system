/**
 * Authentication Service
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, RegisterDTO, LoginDTO, AuthResponse } from '../types/auth.types';
import { JWTService } from './jwt.service';
import { AppError } from '../../../shared/middleware/error-handler';

// Mock user database (replace with real DB queries)
const mockUsers: User[] = [
  {
    id: uuidv4(),
    email: 'admin@example.com',
    password_hash: '$2a$10$FOhnnWYYj8YQtJTgemCKKeljbA0kjXbJ7BdJA9V6WXpv8u6HLzRqS', // password123
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    email: 'admin@crm.com',
    password_hash: '$2b$10$rKvK8w9qJ7qZ5xYz5QqN4.vQ8xH6xN7X5Z9K8vQ8xH6xN7X5Z9K8v', // Admin123!
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    email: 'user@crm.com',
    password_hash: '$2b$10$YHJz5QqN4.vQ8xH6xN7X5Z9K8vQ8xH6xN7X5Z9K8vrKvK8w9qJ7q', // User123!
    first_name: 'Regular',
    last_name: 'User',
    role: 'user',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterDTO): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === data.email);
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists', 'EMAIL_EXISTS');
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, 10);

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email: data.email,
      password_hash,
      first_name: data.first_name,
      last_name: data.last_name,
      role: 'user',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockUsers.push(newUser);

    // Generate JWT token
    const token = JWTService.generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Return user without password
    const { password_hash: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const user = mockUsers.find((u) => u.email === data.email);
    if (!user) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new AppError(403, 'Account is deactivated', 'ACCOUNT_INACTIVE');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password_hash!);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Update last login
    user.last_login = new Date();

    // Generate JWT token
    const token = JWTService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) return null;

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get all users (mock data)
   */
  static async getAllUsers(): Promise<User[]> {
    return mockUsers;
  }
}
