/**
 * Simple in-memory cache manager for MongoDB data
 */

class CacheManager {
  constructor() {
    this.cache = {};
    this.timestamps = {};
    // Default expiration time: 5 minutes
    this.defaultExpirationTime = 5 * 60 * 1000;
  }

  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @param {number} expirationTime - Custom expiration time in milliseconds
   * @returns {any|null} - Cached data or null if not found/expired
   */
  get(key, expirationTime = this.defaultExpirationTime) {
    const data = this.cache[key];
    const timestamp = this.timestamps[key];

    if (data !== undefined && timestamp) {
      const now = Date.now();
      if (now - timestamp < expirationTime) {
        console.log(`Cache hit for key: ${key}`);
        return data;
      } else {
        console.log(`Cache expired for key: ${key}`);
        // Clean up expired cache
        this.invalidate(key);
      }
    }
    console.log(`Cache miss for key: ${key}`);
    return null;
  }

  /**
   * Store data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  set(key, data) {
    this.cache[key] = data;
    this.timestamps[key] = Date.now();
    console.log(`Cached data for key: ${key}`);
  }

  /**
   * Invalidate cache for a key
   * @param {string} key - Cache key to invalidate
   */
  invalidate(key) {
    if (this.cache[key] !== undefined) {
      delete this.cache[key];
      delete this.timestamps[key];
      console.log(`Invalidated cache for key: ${key}`);
    }
  }

  /**
   * Invalidate all cache entries that match a pattern
   * @param {string} pattern - Pattern to match against keys
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    Object.keys(this.cache).forEach(key => {
      if (regex.test(key)) {
        this.invalidate(key);
      }
    });
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache = {};
    this.timestamps = {};
    console.log('Cache cleared');
  }

  /**
   * Get cache stats
   * @returns {Object} - Cache statistics
   */
  getStats() {
    const keys = Object.keys(this.cache);
    return {
      size: keys.length,
      keys: keys,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
    };
  }
}

// Create a singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;
