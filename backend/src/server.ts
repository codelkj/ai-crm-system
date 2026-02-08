/**
 * Server Entry Point
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { APP_CONFIG } from './config';
import { logger } from './shared/utils/logger';
import schedulerService from './shared/services/scheduler.service';

const startServer = async () => {
  try {
    // Test database connection
    // await query('SELECT NOW()');
    // logger.info('Database connected successfully');

    const server = app.listen(APP_CONFIG.port, () => {
      logger.info(`Server running on port ${APP_CONFIG.port} in ${APP_CONFIG.nodeEnv} mode`);
    });

    // Initialize scheduled jobs
    await schedulerService.initialize();

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      schedulerService.stopAll();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
