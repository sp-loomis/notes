import { Database } from 'sqlite3';
import {
  Component,
  ComponentType,
  CreateComponentData,
  UpdateComponentData,
} from '../models/component';
import { ComponentVersion } from '../models/component-version';
import { ComponentRepository } from './component-repository';
import * as crypto from 'crypto';

/**
 * SQLite implementation of the ComponentRepository interface
 */
export class SQLiteComponentRepository implements ComponentRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Creates a new component
   * @param data Component creation data
   * @returns Promise resolving to the ID of the created component
   */
  async createComponent(data: CreateComponentData): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const now = new Date().toISOString();
      this.db.run(
        'INSERT INTO components (note_id, name, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [data.noteId, data.name, data.type, now, now],
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
   * Gets a component by ID
   * @param id Component ID
   * @returns Promise resolving to the component or null if not found
   */
  async getComponentById(id: number): Promise<Component | null> {
    return new Promise<Component | null>((resolve, reject) => {
      this.db.get(
        `SELECT 
          id, note_id as noteId, name, type, 
          created_at as createdAt, updated_at as updatedAt
        FROM components 
        WHERE id = ?`,
        [id],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve(null);
          } else {
            resolve({
              id: row.id,
              noteId: row.noteId,
              name: row.name,
              type: row.type as ComponentType,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            });
          }
        }
      );
    });
  }

  /**
   * Gets all components for a note
   * @param noteId Note ID
   * @returns Promise resolving to an array of components
   */
  async getComponentsByNoteId(noteId: number): Promise<Component[]> {
    return new Promise<Component[]>((resolve, reject) => {
      this.db.all(
        `SELECT 
          id, note_id as noteId, name, type, 
          created_at as createdAt, updated_at as updatedAt
        FROM components 
        WHERE note_id = ?
        ORDER BY name`,
        [noteId],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const components: Component[] = rows.map((row) => ({
              id: row.id,
              noteId: row.noteId,
              name: row.name,
              type: row.type as ComponentType,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            }));
            resolve(components);
          }
        }
      );
    });
  }

  /**
   * Updates a component
   * @param id Component ID
   * @param data Component update data
   * @returns Promise resolving to true if successful, false if component not found
   */
  async updateComponent(id: number, data: UpdateComponentData): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      // Build the update query based on provided data
      const updates: string[] = [];
      const params: any[] = [];

      if (data.name !== undefined) {
        updates.push('name = ?');
        params.push(data.name);
      }

      if (data.type !== undefined) {
        updates.push('type = ?');
        params.push(data.type);
      }

      if (updates.length === 0) {
        resolve(false);
        return;
      }

      // Add updated_at timestamp
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());

      // Add component ID to params
      params.push(id);

      this.db.run(
        `UPDATE components SET ${updates.join(', ')} WHERE id = ?`,
        params,
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
   * Deletes a component and all its versions
   * @param id Component ID
   * @returns Promise resolving to true if successful, false if component not found
   */
  async deleteComponent(id: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      // SQLite will automatically delete component versions due to the CASCADE constraint
      this.db.run(
        'DELETE FROM components WHERE id = ?',
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
   * Creates a new version for a component
   * @param componentId Component ID
   * @param content Component content
   * @returns Promise resolving to the version ID
   */
  async createComponentVersion(componentId: number, content: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // Generate a unique version ID using a hash of component ID and content
      const hasher = crypto.createHash('sha256');
      const timestamp = new Date().getTime(); // Use getTime() instead of Date.now()
      const contentHash = hasher.update(`${componentId}-${content}-${timestamp}`).digest('hex');
      const versionId = contentHash.substring(0, 16); // Using first 16 chars of hash as ID

      const now = new Date().toISOString();
      this.db.run(
        'INSERT INTO component_versions (id, component_id, content, created_at) VALUES (?, ?, ?, ?)',
        [versionId, componentId, content, now],
        (err) => {
          if (err) {
            reject(err);
          } else {
            // Also update the component's updated_at timestamp
            this.db.run(
              'UPDATE components SET updated_at = ? WHERE id = ?',
              [now, componentId],
              (updateErr) => {
                if (updateErr) {
                  reject(updateErr);
                } else {
                  resolve(versionId);
                }
              }
            );
          }
        }
      );
    });
  }

  /**
   * Gets all versions for a component
   * @param componentId Component ID
   * @returns Promise resolving to an array of component versions
   */
  async getComponentVersions(componentId: number): Promise<ComponentVersion[]> {
    return new Promise<ComponentVersion[]>((resolve, reject) => {
      this.db.all(
        `SELECT 
          id, component_id as componentId, content, created_at as createdAt
        FROM component_versions
        WHERE component_id = ?
        ORDER BY created_at DESC`,
        [componentId],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const versions: ComponentVersion[] = rows.map((row) => ({
              id: row.id,
              componentId: row.componentId,
              content: row.content,
              createdAt: new Date(row.createdAt),
            }));
            resolve(versions);
          }
        }
      );
    });
  }

  /**
   * Gets a specific component version
   * @param versionId Version ID
   * @returns Promise resolving to the component version or null if not found
   */
  async getComponentVersion(versionId: string): Promise<ComponentVersion | null> {
    return new Promise<ComponentVersion | null>((resolve, reject) => {
      this.db.get(
        `SELECT 
          id, component_id as componentId, content, created_at as createdAt
        FROM component_versions
        WHERE id = ?`,
        [versionId],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve(null);
          } else {
            resolve({
              id: row.id,
              componentId: row.componentId,
              content: row.content,
              createdAt: new Date(row.createdAt),
            });
          }
        }
      );
    });
  }

  /**
   * Gets the latest version for a component
   * @param componentId Component ID
   * @returns Promise resolving to the latest component version or null if none exists
   */
  async getLatestComponentVersion(componentId: number): Promise<ComponentVersion | null> {
    return new Promise<ComponentVersion | null>((resolve, reject) => {
      this.db.get(
        `SELECT 
          id, component_id as componentId, content, created_at as createdAt
        FROM component_versions
        WHERE component_id = ?
        ORDER BY created_at DESC
        LIMIT 1`,
        [componentId],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve(null);
          } else {
            resolve({
              id: row.id,
              componentId: row.componentId,
              content: row.content,
              createdAt: new Date(row.createdAt),
            });
          }
        }
      );
    });
  }
}
