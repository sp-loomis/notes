import { Database } from 'sqlite3';
import { SQLiteTagRepository } from '../../src/database/repositories/sqlite-tag-repository';
import { Tag, CreateTagData, UpdateTagData, TagTreeNode } from '../../src/database/models/tag';

// Mock database
const mockDb = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
} as unknown as Database;

describe('SQLiteTagRepository', () => {
  let repository: SQLiteTagRepository;
  const dateNow = new Date();
  const mockTag: Tag = {
    id: 1,
    name: 'Test Tag',
    color: '#ff0000',
    parentId: null,
    createdAt: dateNow,
    updatedAt: dateNow,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteTagRepository(mockDb);

    // Mock Date constructor to return a consistent date for testing
    jest.spyOn(global, 'Date').mockImplementation(() => dateNow as unknown as Date);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createTag', () => {
    it('should create a tag and return its ID', async () => {
      const tagData: CreateTagData = {
        name: 'Test Tag',
        color: '#ff0000',
      };

      // Mock the run function to call the callback with lastID
      (mockDb.run as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback.call({ lastID: 1 }, null);
        }
      );

      const result = await repository.createTag(tagData);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO tags (name, color, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [tagData.name, tagData.color, null, dateNow.toISOString(), dateNow.toISOString()],
        expect.any(Function)
      );
      expect(result).toBe(1);
    });

    it('should create a tag with a parent ID', async () => {
      const tagData: CreateTagData = {
        name: 'Test Child Tag',
        color: '#00ff00',
        parentId: 1,
      };

      // Mock the run function to call the callback with lastID
      (mockDb.run as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback.call({ lastID: 2 }, null);
        }
      );

      const result = await repository.createTag(tagData);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO tags (name, color, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [
          tagData.name,
          tagData.color,
          tagData.parentId,
          dateNow.toISOString(),
          dateNow.toISOString(),
        ],
        expect.any(Function)
      );
      expect(result).toBe(2);
    });

    it('should reject with an error if database operation fails', async () => {
      const tagData: CreateTagData = {
        name: 'Test Tag',
        color: '#ff0000',
      };

      // Mock the run function to call the callback with an error
      (mockDb.run as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(new Error('Database error'));
        }
      );

      await expect(repository.createTag(tagData)).rejects.toThrow('Database error');
    });
  });

  describe('getTagById', () => {
    it('should return a tag when it exists', async () => {
      // Mock the get function to call the callback with a tag
      (mockDb.get as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(null, {
            id: 1,
            name: 'Test Tag',
            color: '#ff0000',
            parentId: null,
            createdAt: dateNow.toISOString(),
            updatedAt: dateNow.toISOString(),
          });
        }
      );

      const result = await repository.getTagById(1);

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT id, name, color, parent_id as parentId, created_at as createdAt, updated_at as updatedAt FROM tags WHERE id = ?',
        [1],
        expect.any(Function)
      );
      expect(result).toEqual(mockTag);
    });

    it('should return null when tag does not exist', async () => {
      // Mock the get function to call the callback with null (no result)
      (mockDb.get as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(null, null);
        }
      );

      const result = await repository.getTagById(999);

      expect(result).toBeNull();
    });
  });

  describe('getTagHierarchy', () => {
    it('should return a hierarchical tree of tags', async () => {
      const mockTags: Tag[] = [
        {
          id: 1,
          name: 'Parent',
          color: '#ff0000',
          parentId: null,
          createdAt: dateNow,
          updatedAt: dateNow,
        },
        {
          id: 2,
          name: 'Child 1',
          color: '#00ff00',
          parentId: 1,
          createdAt: dateNow,
          updatedAt: dateNow,
        },
        {
          id: 3,
          name: 'Child 2',
          color: '#0000ff',
          parentId: 1,
          createdAt: dateNow,
          updatedAt: dateNow,
        },
        {
          id: 4,
          name: 'Grandchild',
          color: '#ffff00',
          parentId: 2,
          createdAt: dateNow,
          updatedAt: dateNow,
        },
      ];

      // Mock getAllTags to return our mock tag list
      jest.spyOn(repository, 'getAllTags').mockResolvedValue(mockTags);

      const result = await repository.getTagHierarchy();

      // Expected hierarchy
      const expected: TagTreeNode[] = [
        {
          ...mockTags[0],
          children: [
            {
              ...mockTags[1],
              children: [
                {
                  ...mockTags[3],
                  children: [],
                },
              ],
            },
            {
              ...mockTags[2],
              children: [],
            },
          ],
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  // Additional tests for other methods would follow similar patterns
});
