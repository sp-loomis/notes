import db from '../connection';

/**
 * Define a type for SQLite master table query results
 */
interface SqliteMaster {
  name: string;
  type: string;
  [key: string]: string | number; // More specific than 'any'
}

/**
 * Helper function to run SQL as a Promise
 */
function runSql(sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Helper function to query SQL as a Promise
 */
function querySql(sql: string): Promise<SqliteMaster | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, (err, row) => {
      if (err) {
        reject(err);
      } else {
        // Type assertion since we know the structure of sqlite_master
        resolve(row as SqliteMaster | undefined);
      }
    });
  });
}

/**
 * Initial migration to set up the schema for the Notes application
 */
export async function runMigration(): Promise<void> {
  try {
    // Create the 'notes' table
    await runSql(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create the 'tags' table
    await runSql(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT DEFAULT '#888888',
        parent_id INTEGER,
        FOREIGN KEY (parent_id) REFERENCES tags(id) ON DELETE CASCADE
      );
    `);

    // Create the 'note_tags' junction table
    await runSql(`
      CREATE TABLE IF NOT EXISTS note_tags (
        note_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (note_id, tag_id),
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
    `);

    // Create the 'components' table
    await runSql(`
      CREATE TABLE IF NOT EXISTS components (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        UNIQUE (note_id, name)
      );
    `);

    // Create the 'component_versions' table
    await runSql(`
      CREATE TABLE IF NOT EXISTS component_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        component_id INTEGER NOT NULL,
        version INTEGER NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
        UNIQUE (component_id, version)
      );
    `);

    // Create index for faster tag lookup
    await runSql(`
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
    `);

    // Create index for faster note filtering
    await runSql(`
      CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);
    `);

    console.log('Initial database migration completed successfully.');
  } catch (error) {
    console.error('Error running migration:', error);
    throw error;
  }
}

// Add a function to check if migrations were run
export async function isMigrationNeeded(): Promise<boolean> {
  try {
    const result = await querySql(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='notes'
    `);

    return !result;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return true; // Assume migration is needed if there's an error
  }
}

// Function to run all migrations in sequence
export async function migrateDatabase(): Promise<void> {
  try {
    // Only run migrations if they haven't been run already
    const needsMigration = await isMigrationNeeded();
    if (needsMigration) {
      // Run the initial migration
      await runMigration();
    } else {
      console.log('Database schema already exists. Skipping migrations.');
    }
  } catch (error) {
    console.error('Database migration failed:', error);
  }
}
