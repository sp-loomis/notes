import db from './connection';
import { migrateDatabase } from './migrations/initial';

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
