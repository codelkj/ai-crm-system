/**
 * Authentication Controller
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { RegisterDTO, LoginDTO } from '../types/auth.types';
import { AppError, asyncHandler } from '../../../shared/middleware/error-handler';
import { AuthRequest } from '../../../shared/middleware/authenticate';

export class AuthController {
  /**
   * Register new user
   */
  static register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const data: RegisterDTO = req.body;
    const result = await AuthService.register(data);

    res.status(201).json({
      data: result,
    });
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const data: LoginDTO = req.body;
    const result = await AuthService.login(data);

    res.status(200).json({
      data: result,
    });
  });

  /**
   * Get current user profile
   */
  static me = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated', 'UNAUTHORIZED');
    }

    const user = await AuthService.getUserById(req.user.id);
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    res.status(200).json({
      data: user,
    });
  });

  /**
   * Logout (client-side only - just remove token)
   */
  static logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      message: 'Logged out successfully',
    });
  });
}
