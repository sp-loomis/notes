import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { prepareForRedux } from '../utils/dateUtils';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  linkedNotes: Note[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  currentNote: null,
  linkedNotes: [],
  status: 'idle',
  error: null,
};

// Async Thunks
export const fetchNotes = createAsyncThunk('notes/fetchNotes', async () => {
  const notes = await window.api.notes.list();
  return prepareForRedux(notes);
});

export const fetchNoteById = createAsyncThunk('notes/fetchNoteById', async (id: string) => {
  const note = await window.api.notes.get(id);
  return prepareForRedux(note);
});

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote = await window.api.notes.create(noteData);
    return prepareForRedux(newNote);
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, noteData }: { id: string; noteData: Partial<Omit<Note, 'id' | 'createdAt'>> }) => {
    const updatedNote = await window.api.notes.update(id, noteData);
    return prepareForRedux(updatedNote);
  }
);

export const deleteNote = createAsyncThunk('notes/deleteNote', async (id: string) => {
  await window.api.notes.delete(id);
  return id;
});

export const fetchNotesByTag = createAsyncThunk('notes/fetchNotesByTag', async (tag: string) => {
  const notes = await window.api.notes.getByTag(tag);
  return prepareForRedux(notes);
});

export const fetchLinkedNotes = createAsyncThunk('notes/fetchLinkedNotes', async (noteId: string) => {
  const linkedNotes = await window.api.notes.getLinked(noteId);
  return prepareForRedux(linkedNotes);
});

// Slice
const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setCurrentNote: (state, action: PayloadAction<Note | null>) => {
      state.currentNote = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all notes
      .addCase(fetchNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch notes';
      })
      
      // Fetch note by ID
      .addCase(fetchNoteById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentNote = action.payload;
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch note';
      })
      
      // Create note
      .addCase(createNote.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes.push(action.payload);
        state.currentNote = action.payload;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create note';
      })
      
      // Update note
      .addCase(updateNote.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.notes.findIndex((note) => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        state.currentNote = action.payload;
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update note';
      })
      
      // Delete note
      .addCase(deleteNote.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes = state.notes.filter((note) => note.id !== action.payload);
        if (state.currentNote && state.currentNote.id === action.payload) {
          state.currentNote = null;
        }
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete note';
      })
      
      // Fetch notes by tag
      .addCase(fetchNotesByTag.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotesByTag.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes = action.payload;
      })
      .addCase(fetchNotesByTag.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch notes by tag';
      })
      
      // Fetch linked notes
      .addCase(fetchLinkedNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLinkedNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.linkedNotes = action.payload;
      })
      .addCase(fetchLinkedNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch linked notes';
      });
  },
});

export const { setCurrentNote, clearError } = notesSlice.actions;

export default notesSlice.reducer;