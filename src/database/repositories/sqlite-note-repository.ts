import { Database } from 'sqlite3';
import { CreateNoteData, Note, UpdateNoteData } from '../models/note';
import { NoteRepository } from './note-repository';

/**
 * SQLite implementation of the NoteRepository interface
 */
export class SQLiteNoteRepository implements NoteRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Creates a new note
   * @param data Note creation data
   * @returns Promise resolving to the ID of the created note
   */
  async createNote(data: CreateNoteData): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const now = new Date().toISOString();
      this.db.run(
        'INSERT INTO notes (title, created_at, updated_at) VALUES (?, ?, ?)',
        [data.title, now, now],
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
   * Gets a note by its ID
   * @param id Note ID
   * @returns Promise resolving to the note or null if not found
   */
  async getNoteById(id: number): Promise<Note | null> {
    return new Promise<Note | null>((resolve, reject) => {
      this.db.get(
        'SELECT id, title, created_at as createdAt, updated_at as updatedAt FROM notes WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve(null);
          } else {
            resolve({
              id: row.id,
              title: row.title,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            });
          }
        }
      );
    });
  }

  /**
   * Gets all notes
   * @returns Promise resolving to an array of notes
   */
  async getAllNotes(): Promise<Note[]> {
    return new Promise<Note[]>((resolve, reject) => {
      this.db.all(
        'SELECT id, title, created_at as createdAt, updated_at as updatedAt FROM notes ORDER BY updated_at DESC',
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const notes: Note[] = rows.map((row) => ({
              id: row.id,
              title: row.title,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            }));
            resolve(notes);
          }
        }
      );
    });
  }

  /**
   * Updates a note
   * @param id Note ID
   * @param data Data to update
   * @returns Promise resolving to true if successful, false otherwise
   */
  async updateNote(id: number, data: UpdateNoteData): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      // Only update fields that are provided
      const updates: string[] = [];
      const values: any[] = [];

      if (data.title !== undefined) {
        updates.push('title = ?');
        values.push(data.title);
      }

      // Always update the updated_at timestamp
      updates.push('updated_at = ?');
      values.push(new Date().toISOString());

      // Add the ID as the last parameter
      values.push(id);

      const query = `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`;

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
   * Deletes a note by its ID
   * @param id Note ID
   * @returns Promise resolving to true if successful, false otherwise
   */
  async deleteNote(id: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.db.run(
        'DELETE FROM notes WHERE id = ?',
        [id],
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
   * Finds notes that have at least one of the specified tags or their descendants
   * @param tagIds Array of tag IDs to filter by
   * @returns Promise resolving to an array of matching notes
   */
  async findNotesByTags(tagIds: number[]): Promise<Note[]> {
    return new Promise<Note[]>((resolve, reject) => {
      if (!tagIds.length) {
        resolve([]);
        return;
      }

      const placeholders = tagIds.map(() => '?').join(',');
      const sql = `
        SELECT DISTINCT n.id, n.title, n.created_at as createdAt, n.updated_at as updatedAt 
        FROM notes n
        JOIN note_tags nt ON n.id = nt.note_id
        WHERE nt.tag_id IN (${placeholders})
        ORDER BY n.updated_at DESC`;

      this.db.all(sql, tagIds, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const notes: Note[] = rows.map((row) => ({
            id: row.id,
            title: row.title,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
          }));
          resolve(notes);
        }
      });
    });
  }

  /**
   * Finds notes that have all of the specified tags
   * @param tagIds Array of tag IDs that notes must all have
   * @returns Promise resolving to an array of matching notes
   */
  async findNotesByAllTags(tagIds: number[]): Promise<Note[]> {
    return new Promise<Note[]>((resolve, reject) => {
      if (!tagIds.length) {
        // If no tags specified, return all notes
        this.getAllNotes().then(resolve).catch(reject);
        return;
      }

      const sql = `
        SELECT n.id, n.title, n.created_at as createdAt, n.updated_at as updatedAt 
        FROM notes n
        WHERE (
          SELECT COUNT(DISTINCT nt.tag_id) 
          FROM note_tags nt 
          WHERE nt.note_id = n.id AND nt.tag_id IN (${tagIds.map(() => '?').join(',')})
        ) = ?
        ORDER BY n.updated_at DESC`;

      const params = [...tagIds, tagIds.length];

      this.db.all(sql, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const notes: Note[] = rows.map((row) => ({
            id: row.id,
            title: row.title,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
          }));
          resolve(notes);
        }
      });
    });
  }

  /**
   * Finds notes that have any of the specified tags or their descendants
   * @param tagIds Array of tag IDs where notes must have at least one
   * @param includeDescendants If true, also include notes with descendant tags
   * @returns Promise resolving to an array of matching notes
   */
  async findNotesByAnyTags(tagIds: number[], includeDescendants = false): Promise<Note[]> {
    return new Promise<Note[]>((resolve, reject) => {
      if (!tagIds.length) {
        resolve([]);
        return;
      }

      if (!includeDescendants) {
        // If not including descendants, just use the basic tag filter
        this.findNotesByTags(tagIds).then(resolve).catch(reject);
        return;
      }

      // This recursive query gets all descendant tags of the specified tags
      const sql = `
        WITH RECURSIVE tag_tree AS (
          -- Base case: the specified tags
          SELECT id, parent_id FROM tags WHERE id IN (${tagIds.map(() => '?').join(',')})
          UNION ALL
          -- Recursive case: all child tags
          SELECT t.id, t.parent_id 
          FROM tags t
          JOIN tag_tree tt ON t.parent_id = tt.id
        )
        SELECT DISTINCT n.id, n.title, n.created_at as createdAt, n.updated_at as updatedAt 
        FROM notes n
        JOIN note_tags nt ON n.id = nt.note_id
        JOIN tag_tree tt ON nt.tag_id = tt.id
        ORDER BY n.updated_at DESC`;

      this.db.all(sql, tagIds, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const notes: Note[] = rows.map((row) => ({
            id: row.id,
            title: row.title,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
          }));
          resolve(notes);
        }
      });
    });
  }
}
