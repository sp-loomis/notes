import { getRedisClient, closeRedisConnection, RedisConfig } from '../config/redis';
import { NoteService } from './noteService';
import { TagService } from './tagService';
import { ConnectionError } from '../utils/errors';

/**
 * Main database service providing access to all data services
 */
export class DatabaseService {
  private client: any | null = null;
  private noteService: NoteService | null = null;
  private tagService: TagService | null = null;

  /**
   * Initializes the database service and connects to Redis
   * @param config Optional Redis configuration
   */
  async initialize(config?: RedisConfig): Promise<void> {
    try {
      this.client = await getRedisClient(config);
      
      // Initialize services
      this.noteService = new NoteService(this.client);
      this.tagService = new TagService(this.client);
    } catch (error) {
      throw new ConnectionError((error as Error).message);
    }
  }

  /**
   * Closes the database connection
   */
  async close(): Promise<void> {
    await closeRedisConnection();
    this.client = null;
    this.noteService = null;
    this.tagService = null;
  }

  /**
   * Gets the note service
   * @returns NoteService instance
   */
  getNoteService(): NoteService {
    if (!this.noteService) {
      throw new ConnectionError('Database not initialized. Call initialize() first.');
    }
    return this.noteService;
  }

  /**
   * Gets the tag service
   * @returns TagService instance
   */
  getTagService(): TagService {
    if (!this.tagService) {
      throw new ConnectionError('Database not initialized. Call initialize() first.');
    }
    return this.tagService;
  }

  /**
   * Checks if the database connection is alive
   * @returns True if connected
   */
  async ping(): Promise<boolean> {
    if (!this.client) {
      return false;
    }
    
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch (error) {
      return false;
    }
  }
}