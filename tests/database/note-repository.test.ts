import { Database } from 'sqlite3';
import { SQLiteNoteRepository } from '../../src/database/repositories/sqlite-note-repository';
import { Note, CreateNoteData, UpdateNoteData } from '../../src/database/models/note';

// Mock database
const mockDb = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
} as unknown as Database;

describe('SQLiteNoteRepository', () => {
  let repository: SQLiteNoteRepository;
  const dateNow = new Date();
  const mockNote: Note = {
    id: 1,
    title: 'Test Note',
    createdAt: dateNow,
    updatedAt: dateNow,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteNoteRepository(mockDb);
    
    // Mock Date.now to return a consistent date for testing
    jest.spyOn(global, 'Date').mockImplementation(() => dateNow as unknown as string);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createNote', () => {
    it('should create a note and return its ID', async () => {
      const noteData: CreateNoteData = {
        title: 'Test Note',
      };

      // Mock the run function to call the callback with lastID
      (mockDb.run as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback.call({ lastID: 1 }, null);
        }
      );

      const result = await repository.createNote(noteData);
      
      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO notes (title, created_at, updated_at) VALUES (?, ?, ?)',
        [noteData.title, dateNow.toISOString(), dateNow.toISOString()],
        expect.any(Function)
      );
      expect(result).toBe(1);
    });

    it('should reject with an error if database operation fails', async () => {
      const noteData: CreateNoteData = {
        title: 'Test Note',
      };

      // Mock the run function to call the callback with an error
      (mockDb.run as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(new Error('Database error'));
        }
      );

      await expect(repository.createNote(noteData)).rejects.toThrow('Database error');
    });
  });

  describe('getNoteById', () => {
    it('should return a note when it exists', async () => {
      // Mock the get function to call the callback with a note
      (mockDb.get as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(null, {
            id: 1,
            title: 'Test Note',
            createdAt: dateNow.toISOString(),
            updatedAt: dateNow.toISOString(),
          });
        }
      );

      const result = await repository.getNoteById(1);
      
      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT id, title, created_at as createdAt, updated_at as updatedAt FROM notes WHERE id = ?',
        [1],
        expect.any(Function)
      );
      expect(result).toEqual(mockNote);
    });

    it('should return null when note does not exist', async () => {
      // Mock the get function to call the callback with null (no result)
      (mockDb.get as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(null, null);
        }
      );

      const result = await repository.getNoteById(999);
      
      expect(result).toBeNull();
    });

    it('should reject with an error if database operation fails', async () => {
      // Mock the get function to call the callback with an error
      (mockDb.get as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(new Error('Database error'));
        }
      );

      await expect(repository.getNoteById(1)).rejects.toThrow('Database error');
    });
  });

  // Additional tests for getAllNotes, updateNote, and deleteNote would follow similar patterns
});