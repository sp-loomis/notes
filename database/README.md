# Notes App Database

Redis-based graph database and CRUD library for the Notes application.

## Features

- Redis-based data storage for notes and tags
- Full CRUD operations for notes and tags
- TypeScript interfaces for all data models
- Error handling with custom error types
- Connection management with Redis

## Installation

```bash
npm install
```

## Usage

```typescript
import DatabaseService from '@notes/database';

// Initialize the database service
const db = new DatabaseService();
await db.initialize();

// Get the note service
const noteService = db.getNoteService();

// Create a new note
const note = await noteService.createNote({
  title: 'My Note',
  content: { plainText: 'This is my note content' },
  tags: ['important'],
  links: []
});

// Get a note by ID
const retrievedNote = await noteService.getNote(note.id);

// Update a note
const updatedNote = await noteService.updateNote(note.id, {
  title: 'Updated Title'
});

// Delete a note
await noteService.deleteNote(note.id);

// Close the database connection when done
await db.close();
```

## Testing

```bash
npm test
```

## License

MIT