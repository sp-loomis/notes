import { DatabaseService } from '../src/services/databaseService';
import { NoteService } from '../src/services/noteService';
import { TagService } from '../src/services/tagService';
import { ConnectionError } from '../src/utils/errors';
import { createMockRedisClient } from './setupMocks';

// Mock Redis client factory function
const mockClient = createMockRedisClient();

// Mock the redis module
jest.mock('../src/config/redis', () => ({
  getRedisClient: jest.fn().mockImplementation(() => Promise.resolve(mockClient)),
  closeRedisConnection: jest.fn().mockResolvedValue(undefined),
  RedisConfig: {}
}));

describe('DatabaseService', () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    dbService = new DatabaseService();
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize the database service', async () => {
      await dbService.initialize();
      
      // Should now have access to note and tag services
      expect(dbService.getNoteService()).toBeInstanceOf(NoteService);
      expect(dbService.getTagService()).toBeInstanceOf(TagService);
    });
  });

  describe('getNoteService', () => {
    it('should throw an error if not initialized', () => {
      expect(() => dbService.getNoteService()).toThrow(ConnectionError);
    });

    it('should return a NoteService instance after initialization', async () => {
      await dbService.initialize();
      expect(dbService.getNoteService()).toBeInstanceOf(NoteService);
    });
  });

  describe('getTagService', () => {
    it('should throw an error if not initialized', () => {
      expect(() => dbService.getTagService()).toThrow(ConnectionError);
    });

    it('should return a TagService instance after initialization', async () => {
      await dbService.initialize();
      expect(dbService.getTagService()).toBeInstanceOf(TagService);
    });
  });

  describe('ping', () => {
    it('should return false if not initialized', async () => {
      const result = await dbService.ping();
      expect(result).toBe(false);
    });

    it('should return true after initialization', async () => {
      // Setup ping mock to return PONG
      mockClient.ping.mockResolvedValueOnce('PONG');
      
      await dbService.initialize();
      const result = await dbService.ping();
      expect(result).toBe(true);
    });
  });

  describe('close', () => {
    it('should close the database connection', async () => {
      await dbService.initialize();
      await dbService.close();
      
      // Services should no longer be accessible
      expect(() => dbService.getNoteService()).toThrow(ConnectionError);
      expect(() => dbService.getTagService()).toThrow(ConnectionError);
    });
  });
});