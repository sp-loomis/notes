declare module 'redis-mock' {
  import { RedisClientType } from 'redis';
  export function createClient(): RedisClientType;
}