/**
 * Cache Service using Redis
 * Provides caching functionality for frequently accessed data
 */

import Redis from 'ioredis';

class CacheService {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check if Redis is configured
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      this.client = new Redis(redisUrl, {
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('⚠️  Redis connection failed after 3 attempts. Running without cache.');
            return null; // Stop retrying
          }
          return Math.min(times * 100, 3000);
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('✅ Redis cache connected');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        console.warn('⚠️  Redis error (running without cache):', err.message);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        console.warn('⚠️  Redis connection closed');
      });
    } catch (error) {
      console.warn('⚠️  Redis not available. Running without cache:', error);
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (time to live in seconds)
   */
  async set(key: string, value: any, ttl: number = 300): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      await this.client.del(...keys);
      return keys.length;
    } catch (error) {
      console.error('Cache deletePattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern - common caching pattern
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch the data
    const data = await fetcher();

    // Store in cache for next time
    await this.set(key, data, ttl);

    return data;
  }

  /**
   * Invalidate all caches for a specific firm
   */
  async invalidateFirmCache(firmId: string): Promise<number> {
    return this.deletePattern(`firm:${firmId}:*`);
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

export default new CacheService();
