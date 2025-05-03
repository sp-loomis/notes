/**
 * Note model representing a note in the application
 */
export interface Note {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data needed to create a new note
 */
export interface CreateNoteData {
  title: string;
}

/**
 * Data for updating an existing note
 */
export interface UpdateNoteData {
  title?: string;
}
