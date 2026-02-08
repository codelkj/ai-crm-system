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
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user account
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - first_name
   *               - last_name
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 minLength: 6
   *                 example: SecurePass123!
   *               first_name:
   *                 type: string
   *                 example: John
   *               last_name:
   *                 type: string
   *                 example: Doe
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *                     token:
   *                       type: string
   *       400:
   *         description: Validation error
   *       409:
   *         description: Email already exists
   */
  static register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const data: RegisterDTO = req.body;
    // Use default firm for now (in production, this would come from signup flow)
    const defaultFirmId = '00000000-0000-0000-0000-000000000001';

    const result = await AuthService.register({
      ...data,
      firm_id: data.firm_id || defaultFirmId
    } as any);

    res.status(201).json({
      data: result,
    });
  });

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login to existing account
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: SecurePass123!
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *                     token:
   *                       type: string
   *                       description: JWT token for authentication
   *       400:
   *         description: Validation error
   *       401:
   *         description: Invalid credentials
   */
  static login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const data: LoginDTO = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await AuthService.login(data, ipAddress, userAgent);

    res.status(200).json({
      data: result,
    });
  });

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Get current user profile
   *     tags: [Authentication]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Current user profile
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
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
