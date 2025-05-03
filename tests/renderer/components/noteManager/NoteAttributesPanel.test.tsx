import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NoteAttributesPanel from '../../../../src/renderer/components/noteManager/NoteAttributesPanel';
import { useNotes } from '../../../../src/renderer/contexts/NotesContext';
import { useComponents } from '../../../../src/renderer/contexts/ComponentsContext';
import { tagRepository } from '../../../../src/database';

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

// Mock the tag repository
jest.mock('../../../../src/database', () => ({
  tagRepository: {
    getTagsForNote: jest.fn(),
    addTagToNote: jest.fn(),
    removeTagFromNote: jest.fn(),
  },
}));

describe('NoteAttributesPanel', () => {
  // Default mock values
  const mockUpdateNote = jest.fn();
  const mockDeleteNote = jest.fn();
  const mockOnClose = jest.fn();
  const mockGetTagsForNote = jest.fn();
  const mockAddTagToNote = jest.fn();
  const mockRemoveTagFromNote = jest.fn();

  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();

    // Default mock implementations
    (useNotes as jest.Mock).mockReturnValue({
      selectedNote: {
        id: 1,
        title: 'Test Note',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      },
      updateNote: mockUpdateNote,
      deleteNote: mockDeleteNote,
      loading: false,
      error: null,
    });

    (useComponents as jest.Mock).mockReturnValue({
      components: [],
    });

    // Mock tag repository methods
    tagRepository.getTagsForNote = mockGetTagsForNote.mockResolvedValue([]);
    tagRepository.addTagToNote = mockAddTagToNote.mockResolvedValue(true);
    tagRepository.removeTagFromNote = mockRemoveTagFromNote.mockResolvedValue(true);
  });

  test('renders note details correctly', async () => {
    render(<NoteAttributesPanel onClose={mockOnClose} />);

    // Check that the note title is displayed
    expect(screen.getByText('Test Note')).toBeInTheDocument();

    // Check that date information is displayed
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Modified:/)).toBeInTheDocument();

    // Check that action buttons are rendered
    expect(screen.getByTitle('Edit note')).toBeInTheDocument();
    expect(screen.getByTitle('Delete note')).toBeInTheDocument();
    expect(screen.getByTitle('Close note')).toBeInTheDocument();
  });

  test('enters edit mode when edit button is clicked', () => {
    render(<NoteAttributesPanel onClose={mockOnClose} />);

    // Click the edit button
    fireEvent.click(screen.getByTitle('Edit note'));

    // Check that the component entered edit mode
    expect(screen.getByPlaceholderText('Enter note title')).toBeInTheDocument();
    expect(screen.getByTitle('Save changes')).toBeInTheDocument();
    expect(screen.getByTitle('Cancel editing')).toBeInTheDocument();
  });

  test('updates note title when saving changes', async () => {
    mockUpdateNote.mockResolvedValue(true);

    render(<NoteAttributesPanel onClose={mockOnClose} />);

    // Enter edit mode
    fireEvent.click(screen.getByTitle('Edit note'));

    // Change the title
    const titleInput = screen.getByPlaceholderText('Enter note title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    // Save changes
    fireEvent.click(screen.getByTitle('Save changes'));

    // Verify that updateNote was called with the right data
    await waitFor(() => {
      expect(mockUpdateNote).toHaveBeenCalledWith(1, { title: 'Updated Title' });
    });
  });

  test('cancels editing when cancel button is clicked', () => {
    render(<NoteAttributesPanel onClose={mockOnClose} />);

    // Enter edit mode
    fireEvent.click(screen.getByTitle('Edit note'));

    // Change the title
    const titleInput = screen.getByPlaceholderText('Enter note title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    // Cancel editing
    fireEvent.click(screen.getByTitle('Cancel editing'));

    // Check that we've exited edit mode
    expect(screen.queryByPlaceholderText('Enter note title')).not.toBeInTheDocument();

    // Check that the original title is still displayed
    expect(screen.getByText('Test Note')).toBeInTheDocument();

    // Verify that updateNote was not called
    expect(mockUpdateNote).not.toHaveBeenCalled();
  });

  test('shows delete confirmation when delete button is clicked', () => {
    render(<NoteAttributesPanel onClose={mockOnClose} />);

    // Click the delete button
    fireEvent.click(screen.getByTitle('Delete note'));

    // Check that confirmation dialog is shown
    expect(screen.getByText('Delete Note')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('deletes note when confirmation is accepted', async () => {
    mockDeleteNote.mockResolvedValue(true);

    render(<NoteAttributesPanel onClose={mockOnClose} />);

    // Click the delete button
    fireEvent.click(screen.getByTitle('Delete note'));

    // Confirm deletion
    fireEvent.click(screen.getByText('Delete'));

    // Verify that deleteNote was called
    await waitFor(() => {
      expect(mockDeleteNote).toHaveBeenCalledWith(1);
    });

    // Verify that onClose was called
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('cancels deletion when confirmation is rejected', () => {
    render(<NoteAttributesPanel onClose={mockOnClose} />);

    // Click the delete button
    fireEvent.click(screen.getByTitle('Delete note'));

    // Cancel deletion
    fireEvent.click(screen.getByText('Cancel'));

    // Verify that deleteNote was not called
    expect(mockDeleteNote).not.toHaveBeenCalled();

    // Verify that the confirmation dialog is no longer visible
    expect(screen.queryByText('Delete Note')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(<NoteAttributesPanel onClose={mockOnClose} />);

    // Click the close button
    fireEvent.click(screen.getByTitle('Close note'));

    // Verify that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('displays tags when they are loaded', async () => {
    // Mock tags for the note
    const mockTags = [
      {
        id: 1,
        name: 'Personal',
        color: '#4299e1',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Work',
        color: '#48bb78',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mockGetTagsForNote.mockResolvedValue(mockTags);

    render(<NoteAttributesPanel onClose={mockOnClose} />);

    // Wait for tags to be loaded
    await waitFor(() => {
      expect(screen.getByText('Personal')).toBeInTheDocument();
      expect(screen.getByText('Work')).toBeInTheDocument();
    });
  });

  test('displays error message when there is an error', () => {
    // Mock an error state
    (useNotes as jest.Mock).mockReturnValue({
      selectedNote: {
        id: 1,
        title: 'Test Note',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      },
      updateNote: mockUpdateNote,
      deleteNote: mockDeleteNote,
      loading: false,
      error: 'Failed to load note data',
    });

    render(<NoteAttributesPanel onClose={mockOnClose} />);

    // Check that the error message is displayed
    expect(screen.getByText('Failed to load note data')).toBeInTheDocument();
  });
});
