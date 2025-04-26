import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import App from '../App';
import { fetchNotes } from '../store/notesSlice';
import { fetchTags } from '../store/tagsSlice';
import { setEditorMode } from '../store/uiSlice';

// Mock the Redux store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock the actions
jest.mock('../store/notesSlice', () => ({
  fetchNotes: jest.fn(),
  setCurrentNote: jest.fn(),
}));

jest.mock('../store/tagsSlice', () => ({
  fetchTags: jest.fn(),
}));

jest.mock('../store/uiSlice', () => ({
  setEditorMode: jest.fn(),
}));

// Mock the Layout component to simplify testing
jest.mock('../components/Layout', () => ({ children }: { children: React.ReactNode }) => (
  <div data-testid="layout">{children}</div>
));

// Mock the NoteViewer component
jest.mock('../components/Notes/NoteViewer', () => () => (
  <div data-testid="note-viewer">Note Viewer</div>
));

// Mock the NoteForm component
jest.mock('../components/Notes/NoteForm', () => ({ noteId, onCancel }: { noteId?: string; onCancel: () => void }) => (
  <div data-testid="note-form" onClick={onCancel}>
    {noteId ? `Edit Note ${noteId}` : 'Create New Note'}
  </div>
));

describe('App Component', () => {
  let store: any;

  beforeEach(() => {
    // Reset mocks
    (fetchNotes as jest.Mock).mockReturnValue({ type: 'notes/fetchNotes' });
    (fetchTags as jest.Mock).mockReturnValue({ type: 'tags/fetchTags' });

    // Set document attributes mock (for theme)
    document.body.setAttribute = jest.fn();

    // Create a fresh store for each test
    store = mockStore({
      notes: {
        notes: [],
        currentNote: null,
        status: 'idle',
        error: null,
      },
      tags: {
        tags: [],
        currentTag: null,
      },
      ui: {
        theme: 'dark',
        editorMode: 'view',
        sidebarMode: 'notes',
        sidebarWidth: 250,
        sidebarCollapsed: false,
        searchQuery: '',
      },
    });
  });

  test('renders NoteViewer by default', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // Check if the default view (NoteViewer) is rendered
    expect(screen.getByTestId('note-viewer')).toBeInTheDocument();
  });

  test('sets theme attribute on body', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // Check if the theme was set on the body
    expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  test('dispatches fetchNotes and fetchTags on mount', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // Check if the fetch actions were dispatched
    expect(fetchNotes).toHaveBeenCalled();
    expect(fetchTags).toHaveBeenCalled();
  });

  test('renders NoteForm in create mode when editorMode is create', () => {
    // Set up a store with editorMode set to 'create'
    const createStore = mockStore({
      notes: {
        notes: [],
        currentNote: null,
        status: 'idle',
        error: null,
      },
      tags: {
        tags: [],
        currentTag: null,
      },
      ui: {
        theme: 'dark',
        editorMode: 'create', // Set to create mode
        sidebarMode: 'notes',
        sidebarWidth: 250,
        sidebarCollapsed: false,
        searchQuery: '',
      },
    });

    render(
      <Provider store={createStore}>
        <App />
      </Provider>
    );

    // Check if the NoteForm is rendered
    expect(screen.getByTestId('note-form')).toBeInTheDocument();
    expect(screen.getByText('Create New Note')).toBeInTheDocument();
  });
});