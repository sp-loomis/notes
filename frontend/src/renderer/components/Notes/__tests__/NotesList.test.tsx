import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import NotesList from '../NotesList';
import { fetchNotes, setCurrentNote } from '../../../store/notesSlice';

// Mock the Redux store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock the actions
jest.mock('../../../store/notesSlice', () => ({
  fetchNotes: jest.fn(),
  setCurrentNote: jest.fn(),
}));

describe('NotesList Component', () => {
  let store: any;

  beforeEach(() => {
    // Reset mocks
    (fetchNotes as jest.Mock).mockReturnValue({ type: 'notes/fetchNotes' });
    (setCurrentNote as jest.Mock).mockReturnValue({ type: 'notes/setCurrentNote' });

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
      },
    });
  });

  test('renders empty state when no notes exist', () => {
    render(
      <Provider store={store}>
        <NotesList />
      </Provider>
    );

    expect(screen.getByText('No notes found. Create your first note!')).toBeInTheDocument();
  });

  test('dispatches fetchNotes action when idle', () => {
    render(
      <Provider store={store}>
        <NotesList />
      </Provider>
    );

    expect(fetchNotes).toHaveBeenCalled();
  });

  test('handles refresh button click', () => {
    render(
      <Provider store={store}>
        <NotesList />
      </Provider>
    );

    // Find the refresh button by its title and click it
    const refreshButton = screen.getByTitle('Refresh');
    fireEvent.click(refreshButton);

    expect(fetchNotes).toHaveBeenCalledTimes(2); // Once on mount, once on click
  });

  test('handles new note button click', () => {
    // We'll spy on console.log to see if handleCreateNote function is called
    const consoleSpy = jest.spyOn(console, 'log');
    
    render(
      <Provider store={store}>
        <NotesList />
      </Provider>
    );

    // Find the new note button by its title and click it
    const newNoteButton = screen.getByTitle('New Note');
    fireEvent.click(newNoteButton);

    // Check if the console.log from handleCreateNote was called
    expect(consoleSpy).toHaveBeenCalledWith('Create note');
    
    consoleSpy.mockRestore();
  });

  test('renders notes when they exist', () => {
    const notes = [
      {
        id: '1',
        title: 'Test Note 1',
        content: { plainText: 'This is test note 1' },
        tags: ['test'],
        links: [],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        title: 'Test Note 2',
        content: { plainText: 'This is test note 2' },
        tags: [],
        links: [],
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
      },
    ];

    store = mockStore({
      notes: {
        notes,
        currentNote: null,
        status: 'succeeded',
        error: null,
      },
      tags: {
        tags: [{ id: 'tag1', name: 'test', color: '#ff0000' }],
      },
    });

    render(
      <Provider store={store}>
        <NotesList />
      </Provider>
    );

    expect(screen.getByText('Test Note 1')).toBeInTheDocument();
    expect(screen.getByText('Test Note 2')).toBeInTheDocument();
  });
});