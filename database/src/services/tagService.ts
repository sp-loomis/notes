import { RedisClientType } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { Tag } from '../models/types';
import { NotFoundError, ValidationError } from '../utils/errors';

export class TagService {
  private client: any; // Use any for tests with redis-mock
  private readonly keyPrefix = 'tag:';

  constructor(redisClient: any) {
    this.client = redisClient;
  }

  /**
   * Creates a new tag
   * @param tagData Tag data without id and timestamps
   * @returns The created tag with id and timestamps
   */
  async createTag(tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
    // Validate tag data
    if (!tagData.name) {
      throw new ValidationError('Tag name is required');
    }

    // Check if tag with same name already exists
    const existingTag = await this.findTagByName(tagData.name);
    if (existingTag) {
      throw new ValidationError(`Tag with name "${tagData.name}" already exists`);
    }

    const now = new Date();
    const tag: Tag = {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      ...tagData
    };

    // Store tag in Redis
    const key = this.keyPrefix + tag.id;
    await this.client.json.set(key, '$', tag);

    return tag;
  }

  /**
   * Retrieves a tag by id
   * @param id Tag id
   * @returns The tag if found
   */
  async getTag(id: string): Promise<Tag> {
    const key = this.keyPrefix + id;
    const tag = await this.client.json.get(key) as Tag | null;

    if (!tag) {
      throw new NotFoundError('Tag', id);
    }

    // Convert date strings back to Date objects
    tag.createdAt = new Date(tag.createdAt);
    tag.updatedAt = new Date(tag.updatedAt);

    return tag;
  }

  /**
   * Updates an existing tag
   * @param id Tag id
   * @param tagData Updated tag data
   * @returns The updated tag
   */
  async updateTag(id: string, tagData: Partial<Omit<Tag, 'id' | 'createdAt'>>): Promise<Tag> {
    const key = this.keyPrefix + id;
    
    // Check if tag exists
    const exists = await this.client.exists(key);
    if (!exists) {
      throw new NotFoundError('Tag', id);
    }

    // Get current tag
    const currentTag = await this.getTag(id);
    
    // Check if name is being updated and if it already exists
    if (tagData.name && tagData.name !== currentTag.name) {
      const existingTag = await this.findTagByName(tagData.name);
      if (existingTag) {
        throw new ValidationError(`Tag with name "${tagData.name}" already exists`);
      }
    }
    
    // Update tag
    const updatedTag: Tag = {
      ...currentTag,
      ...tagData,
      updatedAt: new Date()
    };

    // Store updated tag
    await this.client.json.set(key, '$', updatedTag);

    return updatedTag;
  }

  /**
   * Deletes a tag by id
   * @param id Tag id
   * @returns True if the tag was deleted
   */
  async deleteTag(id: string): Promise<boolean> {
    const key = this.keyPrefix + id;
    const deleted = await this.client.del(key);
    
    if (deleted === 0) {
      throw new NotFoundError('Tag', id);
    }
    
    return true;
  }

  /**
   * Lists all tags
   * @returns Array of tags
   */
  async listTags(): Promise<Tag[]> {
    // Get all tag keys
    const keys = await this.client.keys(`${this.keyPrefix}*`);
    
    if (keys.length === 0) {
      return [];
    }

    // Get all tags in parallel
    const pipeline = this.client.multi();
    for (const key of keys) {
      pipeline.json.get(key);
    }
    
    const tags = await pipeline.exec() as unknown as Tag[];
    
    // Convert date strings to Date objects
    return tags.map(tag => ({
      ...tag,
      createdAt: new Date(tag.createdAt),
      updatedAt: new Date(tag.updatedAt)
    }));
  }

  /**
   * Finds a tag by name
   * @param name Tag name
   * @returns The tag if found, null otherwise
   */
  async findTagByName(name: string): Promise<Tag | null> {
    const tags = await this.listTags();
    const tag = tags.find(t => t.name.toLowerCase() === name.toLowerCase());
    return tag || null;
  }
}