import { Database } from 'sqlite3';
import { CreateTagData, Tag, TagTreeNode, UpdateTagData } from '../models/tag';
import { TagRepository } from './tag-repository';

/**
 * SQLite implementation of the TagRepository interface
 */
export class SQLiteTagRepository implements TagRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Creates a new tag
   * @param data Tag creation data
   * @returns Promise resolving to the ID of the created tag
   */
  async createTag(data: CreateTagData): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const now = new Date().toISOString();
      this.db.run(
        'INSERT INTO tags (name, color, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [data.name, data.color, data.parentId || null, now, now],
        function (this: { lastID: number }, err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  /**
   * Gets a tag by its ID
   * @param id Tag ID
   * @returns Promise resolving to the tag or null if not found
   */
  async getTagById(id: number): Promise<Tag | null> {
    return new Promise<Tag | null>((resolve, reject) => {
      this.db.get(
        'SELECT id, name, color, parent_id as parentId, created_at as createdAt, updated_at as updatedAt FROM tags WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve(null);
          } else {
            resolve({
              id: row.id,
              name: row.name,
              color: row.color,
              parentId: row.parentId,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            });
          }
        }
      );
    });
  }

  /**
   * Gets all tags
   * @returns Promise resolving to an array of tags
   */
  async getAllTags(): Promise<Tag[]> {
    return new Promise<Tag[]>((resolve, reject) => {
      this.db.all(
        'SELECT id, name, color, parent_id as parentId, created_at as createdAt, updated_at as updatedAt FROM tags ORDER BY name',
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const tags: Tag[] = rows.map((row) => ({
              id: row.id,
              name: row.name,
              color: row.color,
              parentId: row.parentId,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            }));
            resolve(tags);
          }
        }
      );
    });
  }

  /**
   * Gets child tags of a parent tag
   * @param parentId Parent tag ID (null for root tags)
   * @returns Promise resolving to an array of tags
   */
  async getChildTags(parentId: number | null): Promise<Tag[]> {
    return new Promise<Tag[]>((resolve, reject) => {
      const sql =
        parentId === null
          ? 'SELECT id, name, color, parent_id as parentId, created_at as createdAt, updated_at as updatedAt FROM tags WHERE parent_id IS NULL ORDER BY name'
          : 'SELECT id, name, color, parent_id as parentId, created_at as createdAt, updated_at as updatedAt FROM tags WHERE parent_id = ? ORDER BY name';

      const params = parentId === null ? [] : [parentId];

      this.db.all(sql, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const tags: Tag[] = rows.map((row) => ({
            id: row.id,
            name: row.name,
            color: row.color,
            parentId: row.parentId,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
          }));
          resolve(tags);
        }
      });
    });
  }

  /**
   * Gets the tag hierarchy as a tree
   * @param rootId Optional root tag ID to start from (null for entire hierarchy)
   * @returns Promise resolving to a tree of tags
   */
  async getTagHierarchy(rootId?: number | null): Promise<TagTreeNode[]> {
    // Get all tags first
    const allTags = await this.getAllTags();

    // Function to build tree recursively
    const buildTree = (parentId: number | null): TagTreeNode[] => {
      return allTags
        .filter((tag) => tag.parentId === parentId)
        .map((tag) => ({
          ...tag,
          children: buildTree(tag.id),
        }));
    };

    // If rootId is specified, build tree from that node
    if (rootId !== undefined && rootId !== null) {
      const rootTag = allTags.find((tag) => tag.id === rootId);
      if (!rootTag) {
        return [];
      }
      return [
        {
          ...rootTag,
          children: buildTree(rootId),
        },
      ];
    }

    // Otherwise build the entire tree starting from root nodes
    return buildTree(null);
  }

  /**
   * Updates a tag
   * @param id Tag ID
   * @param data Data to update
   * @returns Promise resolving to true if successful, false otherwise
   */
  async updateTag(id: number, data: UpdateTagData): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      // Only update fields that are provided
      const updates: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name);
      }

      if (data.color !== undefined) {
        updates.push('color = ?');
        values.push(data.color);
      }

      if (data.parentId !== undefined) {
        updates.push('parent_id = ?');
        values.push(data.parentId);
      }

      // Always update the updated_at timestamp
      updates.push('updated_at = ?');
      values.push(new Date().toISOString());

      // Add the ID as the last parameter
      values.push(id);

      const query = `UPDATE tags SET ${updates.join(', ')} WHERE id = ?`;

      this.db.run(query, values, function (this: { changes: number }, err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  /**
   * Deletes a tag by its ID
   * @param id Tag ID
   * @returns Promise resolving to true if successful, false otherwise
   */
  async deleteTag(id: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.db.run('DELETE FROM tags WHERE id = ?', [id], function (this: { changes: number }, err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  /**
   * Add a tag to a note
   * @param noteId Note ID
   * @param tagId Tag ID
   * @returns Promise resolving to true if successful, false otherwise
   */
  async addTagToNote(noteId: number, tagId: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const now = new Date().toISOString();
      this.db.run(
        'INSERT OR IGNORE INTO note_tags (note_id, tag_id, created_at) VALUES (?, ?, ?)',
        [noteId, tagId, now],
        function (this: { changes: number }, err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  /**
   * Remove a tag from a note
   * @param noteId Note ID
   * @param tagId Tag ID
   * @returns Promise resolving to true if successful, false otherwise
   */
  async removeTagFromNote(noteId: number, tagId: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.db.run(
        'DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?',
        [noteId, tagId],
        function (this: { changes: number }, err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  /**
   * Get all tags for a note
   * @param noteId Note ID
   * @returns Promise resolving to an array of tags
   */
  async getTagsForNote(noteId: number): Promise<Tag[]> {
    return new Promise<Tag[]>((resolve, reject) => {
      this.db.all(
        `SELECT t.id, t.name, t.color, t.parent_id as parentId, t.created_at as createdAt, t.updated_at as updatedAt 
         FROM tags t
         JOIN note_tags nt ON t.id = nt.tag_id
         WHERE nt.note_id = ?
         ORDER BY t.name`,
        [noteId],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const tags: Tag[] = rows.map((row) => ({
              id: row.id,
              name: row.name,
              color: row.color,
              parentId: row.parentId,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            }));
            resolve(tags);
          }
        }
      );
    });
  }

  /**
   * Gets all descendant tags of a parent tag
   * @param parentId Parent tag ID
   * @returns Promise resolving to an array of all descendant tags
   */
  async getDescendantTags(parentId: number): Promise<Tag[]> {
    return new Promise<Tag[]>((resolve, reject) => {
      const sql = `
        WITH RECURSIVE tag_tree AS (
          -- Base case: direct children of the parent
          SELECT id, name, color, parent_id, created_at, updated_at
          FROM tags 
          WHERE parent_id = ?
          
          UNION ALL
          
          -- Recursive case: all descendants
          SELECT t.id, t.name, t.color, t.parent_id, t.created_at, t.updated_at
          FROM tags t
          JOIN tag_tree tt ON t.parent_id = tt.id
        )
        SELECT id, name, color, parent_id as parentId, created_at as createdAt, updated_at as updatedAt
        FROM tag_tree
        ORDER BY name`;

      this.db.all(sql, [parentId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const tags: Tag[] = rows.map((row) => ({
            id: row.id,
            name: row.name,
            color: row.color,
            parentId: row.parentId,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
          }));
          resolve(tags);
        }
      });
    });
  }

  /**
   * Gets all ancestor tags of a child tag
   * @param childId Child tag ID
   * @returns Promise resolving to an array of all ancestor tags
   */
  async getAncestorTags(childId: number): Promise<Tag[]> {
    return new Promise<Tag[]>((resolve, reject) => {
      const sql = `
        WITH RECURSIVE tag_tree AS (
          -- Base case: parent of the child
          SELECT t.id, t.name, t.color, t.parent_id, t.created_at, t.updated_at
          FROM tags t
          JOIN tags child ON t.id = child.parent_id
          WHERE child.id = ?
          
          UNION ALL
          
          -- Recursive case: all ancestors
          SELECT t.id, t.name, t.color, t.parent_id, t.created_at, t.updated_at
          FROM tags t
          JOIN tag_tree tt ON t.id = tt.parent_id
        )
        SELECT id, name, color, parent_id as parentId, created_at as createdAt, updated_at as updatedAt
        FROM tag_tree
        ORDER BY name`;

      this.db.all(sql, [childId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const tags: Tag[] = rows.map((row) => ({
            id: row.id,
            name: row.name,
            color: row.color,
            parentId: row.parentId,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
          }));
          resolve(tags);
        }
      });
    });
  }

  /**
   * Gets notes that have the specified tag
   * @param tagId Tag ID
   * @returns Promise resolving to an array of note IDs
   */
  async getNotesWithTag(tagId: number): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
      this.db.all('SELECT note_id FROM note_tags WHERE tag_id = ?', [tagId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const noteIds = rows.map((row) => row.note_id);
          resolve(noteIds);
        }
      });
    });
  }

  /**
   * Moves a tag to a new parent
   * @param tagId Tag ID to move
   * @param newParentId New parent tag ID (null for root level)
   * @returns Promise resolving to true if successful
   */
  async moveTag(tagId: number, newParentId: number | null): Promise<boolean> {
    // First check if moving would create a cycle
    if (newParentId !== null) {
      // Get all descendants of the tag being moved
      const descendants = await this.getDescendantTags(tagId);
      // If new parent is among descendants, this would create a cycle
      if (descendants.some((tag) => tag.id === newParentId)) {
        throw new Error('Cannot move tag: would create a cycle in tag hierarchy');
      }
    }

    // Perform the move
    return this.updateTag(tagId, { parentId: newParentId });
  }
}
