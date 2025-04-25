/**
 * Custom error types for the database layer
 */

// Base class for all database errors
export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Error for when an entity is not found
export class NotFoundError extends DatabaseError {
  constructor(entityType: string, id: string) {
    super(`${entityType} with id "${id}" not found`);
    this.name = 'NotFoundError';
  }
}

// Error for when a connection fails
export class ConnectionError extends DatabaseError {
  constructor(message: string) {
    super(`Database connection error: ${message}`);
    this.name = 'ConnectionError';
  }
}

// Error for when a query fails
export class QueryError extends DatabaseError {
  constructor(query: string, error: string) {
    super(`Query error: ${error} in query "${query}"`);
    this.name = 'QueryError';
  }
}

// Error for validation failures
export class ValidationError extends DatabaseError {
  constructor(message: string) {
    super(`Validation error: ${message}`);
    this.name = 'ValidationError';
  }
}