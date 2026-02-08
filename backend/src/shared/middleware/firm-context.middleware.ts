/**
 * Firm Context Middleware
 * Injects firm_id into request context for multi-tenancy isolation
 */

import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    firm_id: string;
    email: string;
    role?: any;
  };
  firmId?: string; // Convenience accessor
}

/**
 * Extract firm_id from authenticated user and add to request context
 * Must be used AFTER authentication middleware
 */
export const firmContext = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.firm_id) {
    return res.status(403).json({
      success: false,
      message: 'User not associated with any firm'
    });
  }

  // Add firm_id to request for easy access
  req.firmId = req.user.firm_id;

  next();
};

/**
 * Validate that resource belongs to user's firm
 * Prevents cross-tenant data access
 */
export const validateFirmAccess = (resource: any, req: AuthRequest): boolean => {
  if (!req.user || !req.user.firm_id) {
    return false;
  }

  if (!resource || !resource.firm_id) {
    return false;
  }

  return resource.firm_id === req.user.firm_id;
};

/**
 * Middleware to enforce firm isolation on database queries
 * Automatically adds firm_id filter to query parameters
 */
export const enforceFirmIsolation = (req: AuthRequest, res: Response, next: NextFunction) => {
  // For query parameters (GET requests)
  if (req.query && typeof req.query === 'object') {
    (req.query as any).firm_id = req.user?.firm_id;
  }

  // For body parameters (POST/PUT requests)
  if (req.body && typeof req.body === 'object') {
    req.body.firm_id = req.user?.firm_id;
  }

  next();
};
