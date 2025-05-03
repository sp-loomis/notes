import { CreateNoteData, Note, UpdateNoteData } from '../models/note';

/**
 * Repository interface for note operations
 */
export interface NoteRepository {
  /**
   * Creates a new note
   * @param data Note creation data
   * @returns Promise resolving to the ID of the created note
   */
  createNote(data: CreateNoteData): Promise<number>;

  /**
   * Gets a note by its ID
   * @param id Note ID
   * @returns Promise resolving to the note or null if not found
   */
  getNoteById(id: number): Promise<Note | null>;

  /**
   * Gets all notes
   * @returns Promise resolving to an array of notes
   */
  getAllNotes(): Promise<Note[]>;

  /**
   * Updates a note
   * @param id Note ID
   * @param data Data to update
   * @returns Promise resolving to true if successful, false otherwise
   */
  updateNote(id: number, data: UpdateNoteData): Promise<boolean>;

  /**
   * Deletes a note by its ID
   * @param id Note ID
   * @returns Promise resolving to true if successful, false otherwise
   */
  deleteNote(id: number): Promise<boolean>;
}