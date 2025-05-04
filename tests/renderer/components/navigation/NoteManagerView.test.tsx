import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NoteManagerView from '../../../../src/renderer/components/navigation/NoteManagerView';
import { NotesProvider } from '../../../../src/renderer/contexts/NotesContext';
import { ComponentsProvider } from '../../../../src/renderer/contexts/ComponentsContext';

// Mock the context hooks
jest.mock('../../../../src/renderer/contexts/NotesContext', () => {
  const actual = jest.requireActual('../../../../src/renderer/contexts/NotesContext');
  return {
    ...actual,
    useNotes: jest.fn(),
  };
});

jest.mock('../../../../src/renderer/contexts/ComponentsContext', () => {
  const actual = jest.requireActual('../../../../src/renderer/contexts/ComponentsContext');
  return {
    ...actual,
    useComponents: jest.fn(),
  };
});

// Import the mocked hooks
import { useNotes } from '../../../../src/renderer/contexts/NotesContext';
import { useComponents } from '../../../../src/renderer/contexts/ComponentsContext';

describe('NoteManagerView', () => {
  // Default mock values
  const mockSelectNote = jest.fn();
  const mockCreateNote = jest.fn();
  const mockRefreshNotes = jest.fn();
  const mockLoadComponentsForNote = jest.fn();

  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();

    // Default mock implementations
    (useNotes as jest.Mock).mockReturnValue({
      notes: [],
      selectedNote: null,
      loading: false,
      error: null,
      selectNote: mockSelectNote,
      createNote: mockCreateNote,
      refreshNotes: mockRefreshNotes,
    });

    (useComponents as jest.Mock).mockReturnValue({
      components: [],
      loadComponentsForNote: mockLoadComponentsForNote,
    });
  });

  test('renders empty state when no note is selected', () => {
    render(<NoteManagerView />);

    // Check that the empty state is rendered
    expect(screen.getByText('Note Manager')).toBeInTheDocument();
    expect(screen.getByText('No Note Selected')).toBeInTheDocument();
    expect(screen.getByText('Create a new note to get started')).toBeInTheDocument();
  });

  test('renders loading state', () => {
    (useNotes as jest.Mock).mockReturnValue({
      notes: [],
      selectedNote: null,
      loading: true,
      error: null,
      selectNote: mockSelectNote,
      createNote: mockCreateNote,
      refreshNotes: mockRefreshNotes,
    });

    render(<NoteManagerView />);

    // Check that loading state is rendered
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders error state', () => {
    (useNotes as jest.Mock).mockReturnValue({
      notes: [],
      selectedNote: null,
      loading: false,
      error: 'Failed to load notes',
      selectNote: mockSelectNote,
      createNote: mockCreateNote,
      refreshNotes: mockRefreshNotes,
    });

    render(<NoteManagerView />);

    // Check that error state is rendered
    expect(screen.getByText('Failed to load notes')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('displays note creation form when create button is clicked', () => {
    render(<NoteManagerView />);

    // Check that the create button exists and click it
    const createButton = screen.getByLabelText('Create new note');
    fireEvent.click(createButton);

    // Check that the form is displayed
    expect(screen.getByPlaceholderText('Enter note title')).toBeInTheDocument();
  });

  test('creates note when form is submitted', async () => {
    // Mock successful note creation
    mockCreateNote.mockResolvedValue(5);

    render(<NoteManagerView />);

    // Open create form
    const createButton = screen.getByLabelText('Create new note');
    fireEvent.click(createButton);

    // Fill in the form
    const titleInput = screen.getByPlaceholderText('Enter note title');
    fireEvent.change(titleInput, { target: { value: 'New Test Note' } });

    // Submit the form
    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    // Verify that createNote was called with the correct data
    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith({ title: 'New Test Note' });
    });

    // Verify selectNote and loadComponentsForNote were called with the new note ID
    await waitFor(() => {
      expect(mockSelectNote).toHaveBeenCalledWith(5);
      expect(mockLoadComponentsForNote).toHaveBeenCalledWith(5);
    });
  });

  test('displays selected note when a note is selected', () => {
    // Mock selected note
    const mockSelectedNote = {
      id: 3,
      title: 'Selected Note',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
    };

    (useNotes as jest.Mock).mockReturnValue({
      notes: [],
      selectedNote: mockSelectedNote,
      loading: false,
      error: null,
      selectNote: mockSelectNote,
      createNote: mockCreateNote,
      refreshNotes: mockRefreshNotes,
    });

    render(<NoteManagerView />);

    // Check that selected note view is displayed
    expect(screen.getByText('Selected Note')).toBeInTheDocument();
  });

  test('returns to no selected note state when close button is clicked', () => {
    // Mock selected note
    const mockSelectedNote = {
      id: 3,
      title: 'Selected Note',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
    };

    (useNotes as jest.Mock).mockReturnValue({
      notes: [],
      selectedNote: mockSelectedNote,
      loading: false,
      error: null,
      selectNote: mockSelectNote,
      createNote: mockCreateNote,
      refreshNotes: mockRefreshNotes,
    });

    render(<NoteManagerView />);

    // Click the close button
    const closeButton = screen.getByLabelText('Close note');
    fireEvent.click(closeButton);

    // Verify selectNote was called with -1
    expect(mockSelectNote).toHaveBeenCalledWith(-1);
  });
});
