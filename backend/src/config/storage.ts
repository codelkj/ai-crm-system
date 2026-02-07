/**
 * File Storage Configuration
 */

import path from 'path';
import fs from 'fs/promises';

export const STORAGE_CONFIG = {
  basePath: process.env.STORAGE_PATH || './storage',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  allowedMimeTypes: {
    legal: ['application/pdf'],
    financial: ['text/csv', 'application/vnd.ms-excel'],
  },
};

export const getStoragePath = (type: 'legal' | 'financial' | 'temp', filename: string) => {
  const typeMap = {
    legal: 'legal-documents',
    financial: 'csv-uploads',
    temp: 'temp',
  };

  return path.join(STORAGE_CONFIG.basePath, typeMap[type], filename);
};

export const ensureDirectoryExists = async (dirPath: string) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

export const deleteFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
