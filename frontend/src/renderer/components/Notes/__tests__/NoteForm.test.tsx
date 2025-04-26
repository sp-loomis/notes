import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import NoteForm from '../NoteForm';
import { createNote, updateNote } from '../../../store/notesSlice';
import { fetchTags } from '../../../store/tagsSlice';
import { setEditorMode } from '../../../store/uiSlice';

// Mock Redux store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock the actions
jest.mock('../../../store/notesSlice', () => ({
  createNote: jest.fn(),
  updateNote: jest.fn(),
}));

jest.mock('../../../store/tagsSlice', () => ({
  fetchTags: jest.fn(),
}));

jest.mock('../../../store/uiSlice', () => ({
  setEditorMode: jest.fn(),
}));

describe('NoteForm Component', () => {
  let store: any;
  const onCancelMock = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    (createNote as jest.Mock).mockReturnValue({ type: 'notes/createNote' });
    (updateNote as jest.Mock).mockReturnValue({ type: 'notes/updateNote' });
    (fetchTags as jest.Mock).mockReturnValue({ type: 'tags/fetchTags' });
    onCancelMock.mockClear();

    // Create a fresh store for each test
    store = mockStore({
      notes: {
        notes: [],
        status: 'idle',
        error: null,
      },
      tags: {
        tags: [
          { id: 'tag1', name: 'work', color: '#ff0000' },
          { id: 'tag2', name: 'personal', color: '#00ff00' },
        ],
      },
    });
  });

  test('renders New Note form correctly', () => {
    render(
      <Provider store={store}>
        <NoteForm onCancel={onCancelMock} />
      </Provider>
    );

    // Check form title
    expect(screen.getByText('New Note')).toBeInTheDocument();
    
    // Check form inputs
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
    
    // Check tag section
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New tag name')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByTitle('Save Note')).toBeInTheDocument();
    expect(screen.getByTitle('Cancel')).toBeInTheDocument();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(
      <Provider store={store}>
        <NoteForm onCancel={onCancelMock} />
      </Provider>
    );

    // Click the cancel button
    fireEvent.click(screen.getByTitle('Cancel'));
    
    // Check if onCancel was called
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  test('shows error message when submitting without a title', () => {
    render(
      <Provider store={store}>
        <NoteForm onCancel={onCancelMock} />
      </Provider>
    );

    // Click the save button without entering a title
    fireEvent.click(screen.getByTitle('Save Note'));
    
    // Check error message
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(createNote).not.toHaveBeenCalled();
    expect(onCancelMock).not.toHaveBeenCalled();
  });

  test('dispatches createNote action when submitting a new note', () => {
    render(
      <Provider store={store}>
        <NoteForm onCancel={onCancelMock} />
      </Provider>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Note' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'This is a test note' } });
    
    // Click on a tag to select it
    fireEvent.click(screen.getByText('work'));
    
    // Submit the form
    fireEvent.click(screen.getByTitle('Save Note'));
    
    // Check if createNote was called with the correct data
    expect(createNote).toHaveBeenCalledWith({
      title: 'Test Note',
      content: { plainText: 'This is a test note' },
      tags: ['work'],
      links: []
    });
    
    // Check if onCancel was called (to close the form)
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  test('dispatches updateNote action when editing an existing note', () => {
    // Add a note to the store
    const existingNote = {
      id: 'note1',
      title: 'Existing Note',
      content: { plainText: 'This is an existing note' },
      tags: ['personal'],
      links: [],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    };
    
    store = mockStore({
      notes: {
        notes: [existingNote],
        status: 'idle',
        error: null,
      },
      tags: {
        tags: [
          { id: 'tag1', name: 'work', color: '#ff0000' },
          { id: 'tag2', name: 'personal', color: '#00ff00' },
        ],
      },
    });

    render(
      <Provider store={store}>
        <NoteForm noteId="note1" onCancel={onCancelMock} />
      </Provider>
    );

    // Check if form is pre-filled with existing note data
    expect(screen.getByDisplayValue('Existing Note')).toBeInTheDocument();
    expect(screen.getByDisplayValue('This is an existing note')).toBeInTheDocument();
    
    // Modify the title
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Note' } });
    
    // Submit the form
    fireEvent.click(screen.getByTitle('Save Note'));
    
    // Check if updateNote was called with the correct data
    expect(updateNote).toHaveBeenCalledWith({
      id: 'note1',
      noteData: {
        title: 'Updated Note',
        content: { plainText: 'This is an existing note' },
        tags: ['personal']
      }
    });
    
    // Check if onCancel was called (to close the form)
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  test('allows adding a new tag', () => {
    render(
      <Provider store={store}>
        <NoteForm onCancel={onCancelMock} />
      </Provider>
    );

    // Enter a new tag name
    fireEvent.change(screen.getByPlaceholderText('New tag name'), { target: { value: 'newTag' } });
    
    // Click the add tag button
    fireEvent.click(screen.getByTitle('Add Tag'));
    
    // Fill out the title (required for submission)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Note' } });
    
    // Submit the form
    fireEvent.click(screen.getByTitle('Save Note'));
    
    // Check if createNote was called with the new tag
    expect(createNote).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: ['newTag']
      })
    );
  });

  test('handles tag selection and deselection', () => {
    render(
      <Provider store={store}>
        <NoteForm onCancel={onCancelMock} />
      </Provider>
    );

    // Click on a tag to select it
    fireEvent.click(screen.getByText('work'));
    
    // Click on the same tag again to deselect it
    fireEvent.click(screen.getByText('work'));
    
    // Fill out the title (required for submission)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Note' } });
    
    // Submit the form
    fireEvent.click(screen.getByTitle('Save Note'));
    
    // Check if createNote was called with empty tags array
    expect(createNote).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: []
      })
    );
  });
});