// Export models
export * from './models/types';

// Export services
export * from './services/databaseService';
export * from './services/noteService';
export * from './services/tagService';

// Export configuration
export * from './config/redis';

// Export error types
export * from './utils/errors';

// Default export for the main database service
import { DatabaseService } from './services/databaseService';
export default DatabaseService;