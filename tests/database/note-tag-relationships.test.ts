import { Database } from 'sqlite3';
import { SQLiteNoteRepository } from '../../src/database/repositories/sqlite-note-repository';
import { Note } from '../../src/database/models/note';
import { SQLiteTagRepository } from '../../src/database/repositories/sqlite-tag-repository';

// Mock database
const mockDb = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
} as unknown as Database;

describe('Note-Tag Relationships', () => {
  let noteRepository: SQLiteNoteRepository;
  let tagRepository: SQLiteTagRepository;
  const dateNow = new Date();

  // Mock notes
  const mockNotes: Note[] = [
    {
      id: 1,
      title: 'Note with tag 1',
      createdAt: dateNow,
      updatedAt: dateNow,
    },
    {
      id: 2,
      title: 'Note with tags 1 and 2',
      createdAt: dateNow,
      updatedAt: dateNow,
    },
    {
      id: 3,
      title: 'Note with tags 2 and 3',
      createdAt: dateNow,
      updatedAt: dateNow,
    },
    {
      id: 4,
      title: 'Note with tag 3 (child of tag 1)',
      createdAt: dateNow,
      updatedAt: dateNow,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    noteRepository = new SQLiteNoteRepository(mockDb);
    tagRepository = new SQLiteTagRepository(mockDb);

    // Mock Date constructor to return a consistent date for testing
    jest.spyOn(global, 'Date').mockImplementation(() => dateNow as unknown as Date);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('TagRepository - Note-Tag Operations', () => {
    describe('addTagToNote', () => {
      it('should add a tag to a note', async () => {
        // Mock successful tag addition
        (mockDb.run as jest.Mock).mockImplementation(
          (sql: string, params: any[], callback: Function) => {
            callback.call({ changes: 1 }, null);
          }
        );

        const result = await tagRepository.addTagToNote(1, 2);

        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('INSERT OR IGNORE INTO note_tags'),
          [1, 2, expect.any(String)],
          expect.any(Function)
        );

        expect(result).toBe(true);
      });

      it('should return false if tag already exists on note', async () => {
        // Mock no changes (tag already exists)
        (mockDb.run as jest.Mock).mockImplementation(
          (sql: string, params: any[], callback: Function) => {
            callback.call({ changes: 0 }, null);
          }
        );

        const result = await tagRepository.addTagToNote(1, 2);
        expect(result).toBe(false);
      });
    });

    describe('removeTagFromNote', () => {
      it('should remove a tag from a note', async () => {
        // Mock successful tag removal
        (mockDb.run as jest.Mock).mockImplementation(
          (sql: string, params: any[], callback: Function) => {
            callback.call({ changes: 1 }, null);
          }
        );

        const result = await tagRepository.removeTagFromNote(1, 2);

        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('DELETE FROM note_tags'),
          [1, 2],
          expect.any(Function)
        );

        expect(result).toBe(true);
      });

      it('should return false if tag was not on the note', async () => {
        // Mock no changes (tag wasn't on the note)
        (mockDb.run as jest.Mock).mockImplementation(
          (sql: string, params: any[], callback: Function) => {
            callback.call({ changes: 0 }, null);
          }
        );

        const result = await tagRepository.removeTagFromNote(1, 2);
        expect(result).toBe(false);
      });
    });

    describe('getTagsForNote', () => {
      it('should get all tags for a note', async () => {
        // Mock tags retrieval
        (mockDb.all as jest.Mock).mockImplementation(
          (sql: string, params: any[], callback: Function) => {
            if (params[0] === 2) {
              // Note 2 has tags 1 and 2
              callback(null, [
                {
                  id: 1,
                  name: 'Tag 1',
                  color: '#ff0000',
                  parentId: null,
                  createdAt: dateNow.toISOString(),
                  updatedAt: dateNow.toISOString(),
                },
                {
                  id: 2,
                  name: 'Tag 2',
                  color: '#00ff00',
                  parentId: null,
                  createdAt: dateNow.toISOString(),
                  updatedAt: dateNow.toISOString(),
                },
              ]);
            } else {
              callback(null, []);
            }
          }
        );

        const result = await tagRepository.getTagsForNote(2);

        expect(mockDb.all).toHaveBeenCalledWith(
          expect.stringContaining('JOIN note_tags nt ON t.id = nt.tag_id'),
          [2],
          expect.any(Function)
        );

        expect(result).toHaveLength(2);
        expect(result.map((tag) => tag.id)).toEqual([1, 2]);
      });
    });

    describe('getNotesWithTag', () => {
      it('should get all notes that have a specific tag', async () => {
        // Mock note IDs retrieval
        (mockDb.all as jest.Mock).mockImplementation(
          (sql: string, params: any[], callback: Function) => {
            if (params[0] === 1) {
              // Tag 1 is on notes 1 and 2
              callback(null, [{ note_id: 1 }, { note_id: 2 }]);
            } else {
              callback(null, []);
            }
          }
        );

        const result = await tagRepository.getNotesWithTag(1);

        expect(mockDb.all).toHaveBeenCalledWith(
          expect.stringContaining('SELECT note_id FROM note_tags'),
          [1],
          expect.any(Function)
        );

        expect(result).toEqual([1, 2]);
      });
    });
  });

  describe('NoteRepository - Tag Filtering', () => {
    describe('findNotesByTags', () => {
      it('should find notes that have any of the specified tags', async () => {
        // Mock notes retrieval
        (mockDb.all as jest.Mock).mockImplementation(
          (sql: string, params: any[], callback: Function) => {
            // If querying for notes with tags 1 or 2
            if (params.includes(1) && params.includes(2)) {
              callback(null, [
                {
                  id: 1,
                  title: 'Note with tag 1',
                  createdAt: dateNow.toISOString(),
                  updatedAt: dateNow.toISOString(),
                },
                {
                  id: 2,
                  title: 'Note with tags 1 and 2',
                  createdAt: dateNow.toISOString(),
                  updatedAt: dateNow.toISOString(),
                },
                {
                  id: 3,
                  title: 'Note with tags 2 and 3',
                  createdAt: dateNow.toISOString(),
                  updatedAt: dateNow.toISOString(),
                },
              ]);
            } else {
              callback(null, []);
            }
          }
        );

        const result = await noteRepository.findNotesByTags([1, 2]);

        expect(mockDb.all).toHaveBeenCalledWith(
          expect.stringContaining('WHERE nt.tag_id IN (?,?)'),
          [1, 2],
          expect.any(Function)
        );

        expect(result).toHaveLength(3);
      });

      it('should return an empty array when no tag IDs are provided', async () => {
        const result = await noteRepository.findNotesByTags([]);
        expect(result).toEqual([]);
        expect(mockDb.all).not.toHaveBeenCalled();
      });
    });

    describe('findNotesByAllTags', () => {
      it('should find notes that have all of the specified tags', async () => {
        // Mock notes retrieval
        (mockDb.all as jest.Mock).mockImplementation(
          (sql: string, params: any[], callback: Function) => {
            // If querying for notes with both tags 1 and 2
            if (params.length === 3 && params[0] === 1 && params[1] === 2 && params[2] === 2) {
              callback(null, [
                {
                  id: 2,
                  title: 'Note with tags 1 and 2',
                  createdAt: dateNow.toISOString(),
                  updatedAt: dateNow.toISOString(),
                },
              ]);
            } else {
              callback(null, []);
            }
          }
        );

        const result = await noteRepository.findNotesByAllTags([1, 2]);

        expect(mockDb.all).toHaveBeenCalledWith(
          expect.stringContaining('COUNT(DISTINCT nt.tag_id)'),
          [1, 2, 2], // The last 2 is the count of tags
          expect.any(Function)
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(2);
      });

      it('should return all notes when no tag IDs are provided', async () => {
        // Mock getAllNotes
        jest.spyOn(noteRepository, 'getAllNotes').mockResolvedValue(mockNotes);

        const result = await noteRepository.findNotesByAllTags([]);

        expect(noteRepository.getAllNotes).toHaveBeenCalled();
        expect(result).toEqual(mockNotes);
      });
    });

    describe('findNotesByAnyTags', () => {
      it('should find notes with any of the tags without including descendants', async () => {
        // When not including descendants, it should delegate to findNotesByTags
        jest
          .spyOn(noteRepository, 'findNotesByTags')
          .mockResolvedValue([mockNotes[0], mockNotes[1]]);

        const result = await noteRepository.findNotesByAnyTags([1], false);

        expect(noteRepository.findNotesByTags).toHaveBeenCalledWith([1]);
        expect(result).toEqual([mockNotes[0], mockNotes[1]]);
      });

      it('should find notes with the tags or their descendants when includeDescendants is true', async () => {
        // Mock notes retrieval with recursive query
        (mockDb.all as jest.Mock).mockImplementation(
          (sql: string, params: any[], callback: Function) => {
            // If using recursive query with tag 1
            if (params[0] === 1 && sql.includes('WITH RECURSIVE tag_tree')) {
              callback(null, [
                {
                  id: 1,
                  title: 'Note with tag 1',
                  createdAt: dateNow.toISOString(),
                  updatedAt: dateNow.toISOString(),
                },
                {
                  id: 2,
                  title: 'Note with tags 1 and 2',
                  createdAt: dateNow.toISOString(),
                  updatedAt: dateNow.toISOString(),
                },
                {
                  id: 4,
                  title: 'Note with tag 3 (child of tag 1)',
                  createdAt: dateNow.toISOString(),
                  updatedAt: dateNow.toISOString(),
                },
              ]);
            } else {
              callback(null, []);
            }
          }
        );

        const result = await noteRepository.findNotesByAnyTags([1], true);

        expect(mockDb.all).toHaveBeenCalledWith(
          expect.stringContaining('WITH RECURSIVE tag_tree'),
          [1],
          expect.any(Function)
        );

        expect(result).toHaveLength(3);
        expect(result.map((note) => note.id)).toContain(4); // Should include note with a descendant tag
      });

      it('should return an empty array when no tag IDs are provided', async () => {
        const result = await noteRepository.findNotesByAnyTags([]);
        expect(result).toEqual([]);
        expect(mockDb.all).not.toHaveBeenCalled();
      });
    });
  });
});
