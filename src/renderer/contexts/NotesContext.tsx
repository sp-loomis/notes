import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note, CreateNoteData, UpdateNoteData } from '../../database/models/note';
import { noteRepository } from '../../database';

// Define the context type
interface NotesContextType {
  notes: Note[];
  selectedNote: Note | null;
  loading: boolean;
  error: string | null;
  selectNote: (noteId: number) => Promise<void>;
  createNote: (data: CreateNoteData) => Promise<number>;
  updateNote: (id: number, data: UpdateNoteData) => Promise<boolean>;
  deleteNote: (id: number) => Promise<boolean>;
  refreshNotes: () => Promise<void>;
}

// Create the context with default values
const NotesContext = createContext<NotesContextType>({
  notes: [],
  selectedNote: null,
  loading: false,
  error: null,
  selectNote: async () => {},
  createNote: async () => -1,
  updateNote: async () => false,
  deleteNote: async () => false,
  refreshNotes: async () => {},
});

// Custom hook to use the notes context
export const useNotes = () => useContext(NotesContext);

// Provider component
export const NotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load notes on component mount
  useEffect(() => {
    refreshNotes();
  }, []);

  // Function to refresh notes from the database
  const refreshNotes = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const fetchedNotes = await noteRepository.getAllNotes();
      setNotes(fetchedNotes);

      // If we have a selected note, refresh it too
      if (selectedNote) {
        const refreshedNote = await noteRepository.getNoteById(selectedNote.id);
        setSelectedNote(refreshedNote);
      }
    } catch (err) {
      setError(`Failed to load notes: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Select a note by ID
  const selectNote = async (noteId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const note = await noteRepository.getNoteById(noteId);
      setSelectedNote(note);
    } catch (err) {
      setError(`Failed to select note: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error selecting note:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new note
  const createNote = async (data: CreateNoteData): Promise<number> => {
    try {
      setLoading(true);
      setError(null);
      const noteId = await noteRepository.createNote(data);
      await refreshNotes();
      return noteId;
    } catch (err) {
      setError(`Failed to create note: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error creating note:', err);
      return -1;
    } finally {
      setLoading(false);
    }
  };

  // Update a note
  const updateNote = async (id: number, data: UpdateNoteData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const success = await noteRepository.updateNote(id, data);
      if (success) {
        await refreshNotes();
      }
      return success;
    } catch (err) {
      setError(`Failed to update note: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error updating note:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a note
  const deleteNote = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const success = await noteRepository.deleteNote(id);
      if (success) {
        if (selectedNote && selectedNote.id === id) {
          setSelectedNote(null);
        }
        await refreshNotes();
      }
      return success;
    } catch (err) {
      setError(`Failed to delete note: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error deleting note:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        selectedNote,
        loading,
        error,
        selectNote,
        createNote,
        updateNote,
        deleteNote,
        refreshNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export default NotesContext;
