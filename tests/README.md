# Notes Application Test Documentation

This directory contains tests for the Notes application. The tests are organized by module, with each subdirectory corresponding to a module in the application.

## Database Tests

The database tests verify the functionality of our database repositories, which provide data access and manipulation capabilities for the application.

### Note Repository Tests (`database/note-repository.test.ts`)

These tests verify the CRUD operations for notes in the database:

- **createNote**
  - Successfully creates a note with a title and returns the new note ID
  - Properly handles errors when the database operation fails

- **getNoteById**
  - Returns the correct note when it exists in the database
  - Returns null when a note with the specified ID does not exist
  - Properly handles errors when the database operation fails

The tests use Jest's mocking capabilities to mock the SQLite database, allowing us to test the repository logic without requiring an actual database connection.

### Tag Repository Tests (`database/tag-repository.test.ts`)

These tests verify the functionality of the tag repository, which is responsible for managing the hierarchical tag structure:

- **createTag**
  - Successfully creates a tag with a name and color
  - Successfully creates a tag with a parent tag (for hierarchical structure)
  - Properly handles errors when the database operation fails

- **getTagById**
  - Returns the correct tag when it exists in the database
  - Returns null when a tag with the specified ID does not exist

- **getTagHierarchy**
  - Correctly builds the hierarchical tag tree structure
  - Properly organizes tags into parent-child relationships

## Testing Approach

### Mocking Strategy

We use Jest's mocking capabilities to mock database interactions:

- The SQLite `Database` object is mocked to avoid actual database operations
- Methods like `run`, `get`, and `all` are mocked to return predefined results
- The `Date` constructor is mocked to provide consistent timestamps for testing

### Test Coverage

Test coverage is tracked using Jest's built-in coverage tool. As of the current implementation, we have:

- Good coverage of core CRUD operations for notes and tags
- Strong testing of basic tag hierarchy functionality
- Areas for improvement in error handling and edge case testing

## Future Test Expansion

Future tests will include:

1. Component repository tests
2. Component versioning functionality
3. More advanced tag hierarchy operations
4. Note-tag relationship management
5. Search and filtering functionality tests
6. Integration tests between repositories
7. End-to-end tests for complete workflows

## Running Tests

To run the tests, use the following command:

```
npm test
```

To run tests with coverage information:

```
npm test -- --coverage
```