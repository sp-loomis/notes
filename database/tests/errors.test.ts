import {
  DatabaseError,
  NotFoundError,
  ConnectionError,
  QueryError,
  ValidationError
} from '../src/utils/errors';

describe('Custom error types', () => {
  describe('DatabaseError', () => {
    it('should create an error with the correct name and message', () => {
      const error = new DatabaseError('Test database error');
      expect(error.name).toBe('DatabaseError');
      expect(error.message).toBe('Test database error');
    });
  });

  describe('NotFoundError', () => {
    it('should create an error with the correct name and formatted message', () => {
      const error = new NotFoundError('Note', '123');
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Note with id "123" not found');
    });
  });

  describe('ConnectionError', () => {
    it('should create an error with the correct name and formatted message', () => {
      const error = new ConnectionError('Failed to connect');
      expect(error.name).toBe('ConnectionError');
      expect(error.message).toBe('Database connection error: Failed to connect');
    });
  });

  describe('QueryError', () => {
    it('should create an error with the correct name and formatted message', () => {
      const error = new QueryError('SELECT * FROM notes', 'Syntax error');
      expect(error.name).toBe('QueryError');
      expect(error.message).toBe('Query error: Syntax error in query "SELECT * FROM notes"');
    });
  });

  describe('ValidationError', () => {
    it('should create an error with the correct name and formatted message', () => {
      const error = new ValidationError('Missing required field');
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation error: Missing required field');
    });
  });
});