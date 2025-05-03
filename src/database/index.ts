import db from './connection';
import { migrateDatabase } from './migrations/initial';
import { SQLiteNoteRepository } from './repositories/sqlite-note-repository';
import { SQLiteTagRepository } from './repositories/sqlite-tag-repository';
import { NoteRepository } from './repositories/note-repository';
import { TagRepository } from './repositories/tag-repository';

// Create repository instances
export const noteRepository: NoteRepository = new SQLiteNoteRepository(db);
export const tagRepository: TagRepository = new SQLiteTagRepository(db);

// Initialize the database
export async function initializeDatabase(): Promise<void> {
  try {
    // Run migrations
    await migrateDatabase();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Export database connection
export default db;
