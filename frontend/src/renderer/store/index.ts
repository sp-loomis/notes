import { configureStore } from '@reduxjs/toolkit';
import notesReducer from './notesSlice';
import tagsReducer from './tagsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    notes: notesReducer,
    tags: tagsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      // Ignore these field paths in all actions
      ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt', 'payload.*.createdAt', 'payload.*.updatedAt', 'meta.arg.noteData.createdAt', 'meta.arg.noteData.updatedAt'],
      // Ignore these paths in the state
      ignoredPaths: ['notes.notes.*.createdAt', 'notes.notes.*.updatedAt', 'notes.currentNote.createdAt', 'notes.currentNote.updatedAt', 'notes.linkedNotes.*.createdAt', 'notes.linkedNotes.*.updatedAt', 'tags.tags.*.createdAt', 'tags.tags.*.updatedAt'],
    },
  }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;