import { RedisClientType } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '../models/types';
import { NotFoundError, ValidationError } from '../utils/errors';

export class NoteService {
  private client: any; // Use any for tests with redis-mock
  private readonly keyPrefix = 'note:';

  constructor(redisClient: any) {
    this.client = redisClient;
  }

  /**
   * Creates a new note
   * @param noteData Note data without id and timestamps
   * @returns The created note with id and timestamps
   */
  async createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    // Validate note data
    if (!noteData.title) {
      throw new ValidationError('Note title is required');
    }

    const now = new Date();
    const note: Note = {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      ...noteData,
      tags: noteData.tags || [],
      links: noteData.links || []
    };

    // Store note in Redis
    const key = this.keyPrefix + note.id;
    await this.client.json.set(key, '$', note);

    return note;
  }

  /**
   * Retrieves a note by id
   * @param id Note id
   * @returns The note if found
   */
  async getNote(id: string): Promise<Note> {
    const key = this.keyPrefix + id;
    const note = await this.client.json.get(key) as Note | null;

    if (!note) {
      throw new NotFoundError('Note', id);
    }

    // Convert date strings back to Date objects
    note.createdAt = new Date(note.createdAt);
    note.updatedAt = new Date(note.updatedAt);

    return note;
  }

  /**
   * Updates an existing note
   * @param id Note id
   * @param noteData Updated note data
   * @returns The updated note
   */
  async updateNote(id: string, noteData: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note> {
    const key = this.keyPrefix + id;
    
    // Check if note exists
    const exists = await this.client.exists(key);
    if (!exists) {
      throw new NotFoundError('Note', id);
    }

    // Get current note
    const currentNote = await this.getNote(id);
    
    // Update note
    const updatedNote: Note = {
      ...currentNote,
      ...noteData,
      updatedAt: new Date()
    };

    // Store updated note
    await this.client.json.set(key, '$', updatedNote);

    return updatedNote;
  }

  /**
   * Deletes a note by id
   * @param id Note id
   * @returns True if the note was deleted
   */
  async deleteNote(id: string): Promise<boolean> {
    const key = this.keyPrefix + id;
    const deleted = await this.client.del(key);
    
    if (deleted === 0) {
      throw new NotFoundError('Note', id);
    }
    
    return true;
  }

  /**
   * Lists all notes
   * @param limit Optional limit of notes to return
   * @param offset Optional offset for pagination
   * @returns Array of notes
   */
  async listNotes(limit?: number, offset?: number): Promise<Note[]> {
    // Get all note keys
    const keys = await this.client.keys(`${this.keyPrefix}*`);
    
    if (keys.length === 0) {
      return [];
    }

    // Apply pagination if specified
    const paginatedKeys = offset || limit 
      ? keys.slice(offset || 0, offset ? (offset + (limit || keys.length)) : limit)
      : keys;

    // Get all notes in parallel
    const pipeline = this.client.multi();
    for (const key of paginatedKeys) {
      pipeline.json.get(key);
    }
    
    const notes = await pipeline.exec() as unknown as Note[];
    
    // Convert date strings to Date objects
    return notes.map(note => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt)
    }));
  }

  /**
   * Finds notes by tag
   * @param tag Tag to search for
   * @returns Array of notes with the specified tag
   */
  async findNotesByTag(tag: string): Promise<Note[]> {
    // In a real implementation, we would use Redis search capabilities
    // For now, we'll retrieve all notes and filter in memory
    const allNotes = await this.listNotes();
    return allNotes.filter(note => note.tags.includes(tag));
  }

  /**
   * Finds notes linked to the specified note
   * @param noteId Note id
   * @returns Array of linked notes
   */
  async findLinkedNotes(noteId: string): Promise<Note[]> {
    // First verify that the source note exists
    await this.getNote(noteId);
    
    // In a real implementation, we would use Redis graph capabilities
    // For now, we'll retrieve all notes and filter in memory
    const allNotes = await this.listNotes();
    return allNotes.filter(note => 
      note.links.some(link => link.targetId === noteId)
    );
  }
}