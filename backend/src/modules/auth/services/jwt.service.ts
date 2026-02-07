/**
 * JWT Service
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { APP_CONFIG } from '../../../config';
import { JWTPayload } from '../types/auth.types';

export class JWTService {
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, APP_CONFIG.jwtSecret, {
      expiresIn: APP_CONFIG.jwtExpiresIn as any,
    });
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, APP_CONFIG.jwtSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}
