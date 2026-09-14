const redis = require('redis');
module.exports = class RedisCacheServices {

  constructor() {
    this.client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis connected');
    });

    this.client.connect().catch(console.error);
  }
  /**
   * @set
   */

  async set(key, value, expireTimeInSeconds = process.env.REDIS_DEFAULT_EXPIRATION || 3600) {
    try {
      await this.client.setEx(key, expireTimeInSeconds, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error("Set key error:", err);
      throw err;
    }
  }
  /**
   * @get
   */

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Get key error:", err);
      throw err;
    }
  }
  /**
   * @delete
   */

  async delete(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (err) {
      console.error("Delete key error:", err);
      throw err;
    }
  }
  /**
   * @flushAll
   */

  async flushAll() {
    try {
      await this.client.flushAll();
      console.log('All keys flushed');
    } catch (err) {
      console.error("Flush error:", err);
      throw err;
    }
  }

}