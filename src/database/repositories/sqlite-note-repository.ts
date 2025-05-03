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
}