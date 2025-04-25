import { createClient } from 'redis';

export interface RedisConfig {
  url: string;
  password?: string;
  username?: string;
}

// Default Redis configuration
const defaultConfig: RedisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
};

/**
 * Creates and returns a Redis client instance
 * @param config Optional Redis configuration
 * @returns Redis client
 */
export const createRedisClient = async (config: RedisConfig = defaultConfig) => {
  const client = createClient({
    url: config.url,
    password: config.password,
    username: config.username,
  });
  
  client.on('error', (err) => {
    console.error('Redis Client Error', err);
  });
  
  await client.connect();
  
  return client;
};

/**
 * Returns a singleton Redis client instance
 */
let redisClient: ReturnType<typeof createClient> | null = null;

export const getRedisClient = async (config: RedisConfig = defaultConfig) => {
  if (!redisClient) {
    redisClient = await createRedisClient(config);
  }
  return redisClient;
};

/**
 * Closes the Redis client connection
 */
export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};