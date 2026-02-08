/**
 * Authentication Service (Database-backed with Multi-tenancy)
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, RegisterDTO, LoginDTO, AuthResponse } from '../types/auth.types';
import { JWTService } from './jwt.service';
import { AppError } from '../../../shared/middleware/error-handler';
import userService from './user.service';
import auditLogService, { AuditAction } from '../../legal-crm/services/audit-log.service';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterDTO & { firm_id: string }): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await userService.findByEmail(data.email);
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists', 'EMAIL_EXISTS');
    }

    // Create new user
    const newUser = await userService.create({
      firm_id: data.firm_id,
      email: data.email,
      password: data.password,
      name: `${data.first_name} ${data.last_name}`,
      job_title: 'User'
    });

    // Generate JWT token with firm_id and role data
    const token = JWTService.generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role?.name || 'user',
      firm_id: newUser.firm_id,
      role_id: newUser.role_id,
      role_level: newUser.role?.level,
      permissions: newUser.role?.permissions
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
  static async login(data: LoginDTO, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    // Find user by email
    const user = await userService.findByEmail(data.email);
    if (!user) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new AppError(403, 'Account is deactivated', 'ACCOUNT_INACTIVE');
    }

    // Verify password
    const isValidPassword = await userService.verifyPassword(data.password, user.password_hash!);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Update last login
    await userService.updateLastLogin(user.id);

    // Log login event
    await auditLogService.log({
      firm_id: user.firm_id,
      user_id: user.id,
      action: AuditAction.LOGIN,
      entity_type: 'auth',
      ip_address: ipAddress,
      user_agent: userAgent
    });

    // Generate JWT token with firm_id and role data
    const token = JWTService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role?.name || 'user',
      firm_id: user.firm_id,
      role_id: user.role_id,
      role_level: user.role?.level,
      permissions: user.role?.permissions
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
    const user = await userService.findById(id);
    if (!user) return null;

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get all users for a firm
   */
  static async getAllUsers(firmId: string): Promise<any[]> {
    return userService.getAll(firmId);
  }
}
