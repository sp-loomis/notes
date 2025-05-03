import { Database } from 'sqlite3';
import { SQLiteTagRepository } from '../../src/database/repositories/sqlite-tag-repository';
import { Tag, CreateTagData, UpdateTagData, TagTreeNode } from '../../src/database/models/tag';

// Mock database
const mockDb = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
} as unknown as Database;

describe('SQLiteTagRepository - Tag Hierarchies', () => {
  let repository: SQLiteTagRepository;
  const dateNow = new Date();

  const mockTags: Tag[] = [
    // Root tags
    {
      id: 1,
      name: 'Root Tag 1',
      color: '#ff0000',
      parentId: null,
      createdAt: dateNow,
      updatedAt: dateNow,
    },
    {
      id: 2,
      name: 'Root Tag 2',
      color: '#00ff00',
      parentId: null,
      createdAt: dateNow,
      updatedAt: dateNow,
    },
    // Children of Root Tag 1
    {
      id: 3,
      name: 'Child 1.1',
      color: '#0000ff',
      parentId: 1,
      createdAt: dateNow,
      updatedAt: dateNow,
    },
    {
      id: 4,
      name: 'Child 1.2',
      color: '#ffff00',
      parentId: 1,
      createdAt: dateNow,
      updatedAt: dateNow,
    },
    // Child of Child 1.1
    {
      id: 5,
      name: 'Grandchild 1.1.1',
      color: '#ff00ff',
      parentId: 3,
      createdAt: dateNow,
      updatedAt: dateNow,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteTagRepository(mockDb);

    // Mock Date constructor to return a consistent date for testing
    jest.spyOn(global, 'Date').mockImplementation(() => dateNow as unknown as Date);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getDescendantTags', () => {
    it('should return all descendant tags for a parent tag', async () => {
      // Mock the all method to return descendant tags for parent id 1
      (mockDb.all as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          // If querying for descendants of tag 1, return tags 3, 4, and 5
          if (params[0] === 1) {
            callback(null, [
              {
                id: 3,
                name: 'Child 1.1',
                color: '#0000ff',
                parentId: 1,
                createdAt: dateNow.toISOString(),
                updatedAt: dateNow.toISOString(),
              },
              {
                id: 4,
                name: 'Child 1.2',
                color: '#ffff00',
                parentId: 1,
                createdAt: dateNow.toISOString(),
                updatedAt: dateNow.toISOString(),
              },
              {
                id: 5,
                name: 'Grandchild 1.1.1',
                color: '#ff00ff',
                parentId: 3,
                createdAt: dateNow.toISOString(),
                updatedAt: dateNow.toISOString(),
              },
            ]);
          } else {
            callback(null, []);
          }
        }
      );

      const result = await repository.getDescendantTags(1);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('WITH RECURSIVE tag_tree'),
        [1],
        expect.any(Function)
      );

      expect(result).toHaveLength(3);
      expect(result.map((tag) => tag.id)).toEqual([3, 4, 5]);
    });

    it('should return an empty array when tag has no descendants', async () => {
      // Mock the all method to return no descendants
      (mockDb.all as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(null, []);
        }
      );

      const result = await repository.getDescendantTags(5); // Grandchild with no descendants

      expect(result).toHaveLength(0);
    });
  });

  describe('getAncestorTags', () => {
    it('should return all ancestor tags for a child tag', async () => {
      // Mock the all method to return ancestor tags for child id 5
      (mockDb.all as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          // If querying for ancestors of tag 5, return tags 3 and 1
          if (params[0] === 5) {
            callback(null, [
              {
                id: 3,
                name: 'Child 1.1',
                color: '#0000ff',
                parentId: 1,
                createdAt: dateNow.toISOString(),
                updatedAt: dateNow.toISOString(),
              },
              {
                id: 1,
                name: 'Root Tag 1',
                color: '#ff0000',
                parentId: null,
                createdAt: dateNow.toISOString(),
                updatedAt: dateNow.toISOString(),
              },
            ]);
          } else {
            callback(null, []);
          }
        }
      );

      const result = await repository.getAncestorTags(5);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('WITH RECURSIVE tag_tree'),
        [5],
        expect.any(Function)
      );

      expect(result).toHaveLength(2);
      expect(result.map((tag) => tag.id)).toEqual([3, 1]);
    });

    it('should return an empty array when tag has no ancestors', async () => {
      // Mock the all method to return no ancestors
      (mockDb.all as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(null, []);
        }
      );

      const result = await repository.getAncestorTags(1); // Root tag with no ancestors

      expect(result).toHaveLength(0);
    });
  });

  describe('moveTag', () => {
    it('should move a tag to a new parent', async () => {
      // Mock getDescendantTags to verify no cycles are created
      jest.spyOn(repository, 'getDescendantTags').mockResolvedValue([]);

      // Mock updateTag to simulate a successful update
      jest.spyOn(repository, 'updateTag').mockResolvedValue(true);

      const result = await repository.moveTag(3, 2);

      expect(repository.getDescendantTags).toHaveBeenCalledWith(3);
      expect(repository.updateTag).toHaveBeenCalledWith(3, { parentId: 2 });
      expect(result).toBe(true);
    });

    it('should throw an error when move would create a cycle', async () => {
      // Mock getDescendantTags to simulate a cycle if we try to move a parent under its child
      jest.spyOn(repository, 'getDescendantTags').mockResolvedValue([
        { ...mockTags[4] }, // Return tag 5 as a descendant
      ]);

      // Create an explicit mock for updateTag
      const updateTagMock = jest.spyOn(repository, 'updateTag');

      await expect(repository.moveTag(1, 5)).rejects.toThrow(
        'Cannot move tag: would create a cycle in tag hierarchy'
      );

      expect(repository.getDescendantTags).toHaveBeenCalledWith(1);
      expect(updateTagMock).not.toHaveBeenCalled();
    });
  });
});
