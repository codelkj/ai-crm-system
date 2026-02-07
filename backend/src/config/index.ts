/**
 * Central Configuration Export
 */

export { default as database, query } from './database';
export { default as openai, callAI, AI_CONFIG } from './ai';
export { STORAGE_CONFIG, getStoragePath, ensureDirectoryExists, deleteFile } from './storage';

export const APP_CONFIG = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
