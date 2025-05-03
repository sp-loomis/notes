import { CreateTagData, Tag, TagTreeNode, UpdateTagData } from '../models/tag';

/**
 * Repository interface for tag operations
 */
export interface TagRepository {
  /**
   * Creates a new tag
   * @param data Tag creation data
   * @returns Promise resolving to the ID of the created tag
   */
  createTag(data: CreateTagData): Promise<number>;

  /**
   * Gets a tag by its ID
   * @param id Tag ID
   * @returns Promise resolving to the tag or null if not found
   */
  getTagById(id: number): Promise<Tag | null>;

  /**
   * Gets all tags
   * @returns Promise resolving to an array of tags
   */
  getAllTags(): Promise<Tag[]>;

  /**
   * Gets child tags of a parent tag
   * @param parentId Parent tag ID (null for root tags)
   * @returns Promise resolving to an array of tags
   */
  getChildTags(parentId: number | null): Promise<Tag[]>;

  /**
   * Gets the tag hierarchy as a tree
   * @param rootId Optional root tag ID to start from (null for entire hierarchy)
   * @returns Promise resolving to a tree of tags
   */
  getTagHierarchy(rootId?: number | null): Promise<TagTreeNode[]>;

  /**
   * Updates a tag
   * @param id Tag ID
   * @param data Data to update
   * @returns Promise resolving to true if successful, false otherwise
   */
  updateTag(id: number, data: UpdateTagData): Promise<boolean>;

  /**
   * Deletes a tag by its ID
   * @param id Tag ID
   * @returns Promise resolving to true if successful, false otherwise
   */
  deleteTag(id: number): Promise<boolean>;

  /**
   * Add a tag to a note
   * @param noteId Note ID
   * @param tagId Tag ID
   * @returns Promise resolving to true if successful, false otherwise
   */
  addTagToNote(noteId: number, tagId: number): Promise<boolean>;

  /**
   * Remove a tag from a note
   * @param noteId Note ID
   * @param tagId Tag ID
   * @returns Promise resolving to true if successful, false otherwise
   */
  removeTagFromNote(noteId: number, tagId: number): Promise<boolean>;

  /**
   * Get all tags for a note
   * @param noteId Note ID
   * @returns Promise resolving to an array of tags
   */
  getTagsForNote(noteId: number): Promise<Tag[]>;
}