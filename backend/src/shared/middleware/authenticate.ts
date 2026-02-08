/**
 * JWT Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { APP_CONFIG } from '../../config';
import { AppError } from './error-handler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firm_id: string;
    role_id?: string;
    role_level?: number;
    permissions?: any;
  };
  firmId?: string; // Convenience accessor
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided', 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, APP_CONFIG.jwtSecret) as any;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      firm_id: decoded.firm_id,
      role_id: decoded.role_id,
      role_level: decoded.role_level,
      permissions: decoded.permissions,
    };

    // Add convenience accessor
    req.firmId = decoded.firm_id;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token', 'INVALID_TOKEN'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated', 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN'));
    }

    next();
  };
};

/**
 * Permission-based authorization (more granular than role-based)
 * Checks if user has specific permission for a resource/action
 */
export const authorizePermission = (resource: string, action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated', 'UNAUTHORIZED'));
    }

    if (!req.user.permissions || !req.user.permissions[resource]) {
      return next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN'));
    }

    const permissions = req.user.permissions[resource];
    if (Array.isArray(permissions) && (permissions.includes(action) || permissions.includes('all'))) {
      return next();
    }

    return next(new AppError(403, 'Insufficient permissions for this action', 'FORBIDDEN'));
  };
};

/**
 * Level-based authorization (for legal hierarchy)
 * Allows users at or below specified level
 */
export const authorizeLevel = (maxLevel: number) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated', 'UNAUTHORIZED'));
    }

    if (!req.user.role_level || req.user.role_level > maxLevel) {
      return next(new AppError(403, 'Insufficient role level', 'FORBIDDEN'));
    }

    next();
  };
};
