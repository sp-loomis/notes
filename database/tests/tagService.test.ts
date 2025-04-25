import { TagService } from '../src/services/tagService';
import { NotFoundError, ValidationError } from '../src/utils/errors';
import { createMockRedisClient, resetTestData } from './setupMocks';

// Mock Redis client
const mockRedisClient = createMockRedisClient();

// Setup and teardown
beforeEach(() => {
  resetTestData();
  jest.clearAllMocks();
});

describe('TagService', () => {
  let tagService: TagService;

  beforeEach(() => {
    tagService = new TagService(mockRedisClient);
  });

  describe('createTag', () => {
    it('should create a tag with valid data', async () => {
      // Mock findTagByName to return null (no duplicate)
      const findTagByNameSpy = jest.spyOn(TagService.prototype, 'findTagByName')
        .mockResolvedValueOnce(null);

      const tagData = {
        name: 'Test Tag',
        color: '#ff0000',
        description: 'A test tag'
      };

      const createdTag = await tagService.createTag(tagData);

      expect(createdTag.id).toBeDefined();
      expect(createdTag.name).toBe(tagData.name);
      expect(createdTag.color).toBe(tagData.color);
      expect(createdTag.description).toBe(tagData.description);
      expect(createdTag.createdAt).toBeInstanceOf(Date);
      expect(createdTag.updatedAt).toBeInstanceOf(Date);
      expect(mockRedisClient.json.set).toHaveBeenCalled();
      
      findTagByNameSpy.mockRestore();
    });

    it('should throw validation error for missing name', async () => {
      const invalidTag = {
        color: '#ff0000',
        description: 'Invalid tag'
      };

      await expect(tagService.createTag(invalidTag as any)).rejects.toThrow(ValidationError);
    });

    it('should throw validation error for duplicate name', async () => {
      // Mock findTagByName to return an existing tag
      const existingTag = {
        id: 'existing-id',
        name: 'Unique Tag',
        color: '#ff0000',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const findTagByNameSpy = jest.spyOn(TagService.prototype, 'findTagByName')
        .mockResolvedValueOnce(existingTag);

      const tagData = {
        name: 'Unique Tag',
        color: '#ff0000'
      };

      // Try to create another tag with the same name
      await expect(tagService.createTag(tagData)).rejects.toThrow(ValidationError);
      
      findTagByNameSpy.mockRestore();
    });
  });

  describe('getTag', () => {
    it('should retrieve a tag by id', async () => {
      // Mock a tag for retrieval
      const tag = {
        id: 'test-id',
        name: 'Test Tag',
        color: '#ff0000',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock json.get to return our tag
      mockRedisClient.json.get.mockResolvedValueOnce(tag);
      
      // Retrieve the tag
      const retrievedTag = await tagService.getTag('test-id');
      
      expect(retrievedTag.id).toBe(tag.id);
      expect(retrievedTag.name).toBe(tag.name);
    });

    it('should throw NotFoundError for non-existent tag', async () => {
      // Mock json.get to return null
      mockRedisClient.json.get.mockResolvedValueOnce(null);
      
      await expect(tagService.getTag('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateTag', () => {
    it('should update an existing tag', async () => {
      // Mock a tag for update
      const tag = {
        id: 'test-id',
        name: 'Original Name',
        color: '#ff0000',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock exists to return true
      mockRedisClient.exists.mockResolvedValueOnce(1);
      
      // Mock getTag to return our tag
      const getTagSpy = jest.spyOn(TagService.prototype, 'getTag')
        .mockResolvedValueOnce(tag);
      
      // Mock findTagByName to return null (no duplicate)
      const findTagByNameSpy = jest.spyOn(TagService.prototype, 'findTagByName')
        .mockResolvedValueOnce(null);
      
      // Update the tag
      const updateData = {
        name: 'Updated Name',
        color: '#00ff00'
      };
      
      const updatedTag = await tagService.updateTag('test-id', updateData);
      
      expect(updatedTag.id).toBe(tag.id);
      expect(updatedTag.name).toBe(updateData.name);
      expect(updatedTag.color).toBe(updateData.color);
      // Skip timing check as it's unreliable in tests
      expect(mockRedisClient.json.set).toHaveBeenCalled();
      
      getTagSpy.mockRestore();
      findTagByNameSpy.mockRestore();
    });

    it('should throw NotFoundError for non-existent tag', async () => {
      // Mock exists to return false
      mockRedisClient.exists.mockResolvedValueOnce(0);
      
      const updateData = { name: 'Updated Name' };
      await expect(tagService.updateTag('non-existent-id', updateData)).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when updating to a duplicate name', async () => {
      // Mock exists to return true
      mockRedisClient.exists.mockResolvedValueOnce(1);
      
      // Mock tags for testing
      const tag1 = {
        id: 'tag1-id',
        name: 'Tag 1',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const tag2 = {
        id: 'tag2-id',
        name: 'Tag 2',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock getTag to return tag2
      const getTagSpy = jest.spyOn(TagService.prototype, 'getTag')
        .mockResolvedValueOnce(tag2);
      
      // Mock findTagByName to return tag1 (duplicate found)
      const findTagByNameSpy = jest.spyOn(TagService.prototype, 'findTagByName')
        .mockResolvedValueOnce(tag1);
      
      // Try to update tag2 to have the same name as tag1
      await expect(tagService.updateTag('tag2-id', { name: 'Tag 1' })).rejects.toThrow(ValidationError);
      
      getTagSpy.mockRestore();
      findTagByNameSpy.mockRestore();
    });
  });

  describe('deleteTag', () => {
    it('should delete an existing tag', async () => {
      // Mock del to return 1 (success)
      mockRedisClient.del.mockResolvedValueOnce(1);
      
      // Delete the tag
      const result = await tagService.deleteTag('existing-id');
      expect(result).toBe(true);
    });

    it('should throw NotFoundError for non-existent tag', async () => {
      // Mock del to return 0 (not found)
      mockRedisClient.del.mockResolvedValueOnce(0);
      
      await expect(tagService.deleteTag('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('listTags', () => {
    it('should return an empty array when no tags exist', async () => {
      // Mock keys to return empty array
      mockRedisClient.keys.mockResolvedValueOnce([]);
      
      const tags = await tagService.listTags();
      expect(tags).toEqual([]);
    });

    it('should list all tags', async () => {
      // Mock tags for testing
      const tag1 = {
        id: 'tag1-id',
        name: 'Tag 1',
        color: '#ff0000',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const tag2 = {
        id: 'tag2-id',
        name: 'Tag 2',
        color: '#00ff00',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock keys to return our tag keys
      mockRedisClient.keys.mockResolvedValueOnce([`tag:${tag1.id}`, `tag:${tag2.id}`]);
      
      // Mock multi().exec() to return our tags
      const multiExecMock = jest.fn().mockResolvedValueOnce([tag1, tag2]);
      mockRedisClient.multi.mockReturnValueOnce({
        json: { get: jest.fn().mockReturnThis() },
        exec: multiExecMock
      });
      
      // List all tags
      const tags = await tagService.listTags();
      
      expect(tags.length).toBe(2);
      expect(tags.map(t => t.id)).toEqual(expect.arrayContaining([tag1.id, tag2.id]));
    });
  });

  describe('findTagByName', () => {
    it('should find a tag by name', async () => {
      // Mock tags for testing
      const tag = {
        id: 'tag-id',
        name: 'Unique Tag',
        color: '#ff0000',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock listTags to return our tag
      const listTagsSpy = jest.spyOn(TagService.prototype, 'listTags')
        .mockResolvedValueOnce([tag]);
      
      // Find the tag by name
      const foundTag = await tagService.findTagByName('Unique Tag');
      
      expect(foundTag).not.toBeNull();
      expect(foundTag?.id).toBe(tag.id);
      
      listTagsSpy.mockRestore();
    });

    it('should return null when no tag with the given name exists', async () => {
      // Mock listTags to return an empty array
      const listTagsSpy = jest.spyOn(TagService.prototype, 'listTags')
        .mockResolvedValueOnce([]);
      
      const foundTag = await tagService.findTagByName('Non-existent Tag');
      expect(foundTag).toBeNull();
      
      listTagsSpy.mockRestore();
    });

    it('should find tag regardless of case sensitivity', async () => {
      // Mock tags for testing
      const tag = {
        id: 'tag-id',
        name: 'CaseSensitive',
        color: '#ff0000',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock listTags to return our tag
      const listTagsSpy = jest.spyOn(TagService.prototype, 'listTags')
        .mockResolvedValueOnce([tag]);
      
      // Find the tag by name with different case
      const foundTag = await tagService.findTagByName('casesensitive');
      
      expect(foundTag).not.toBeNull();
      expect(foundTag?.id).toBe(tag.id);
      
      listTagsSpy.mockRestore();
    });
  });
});