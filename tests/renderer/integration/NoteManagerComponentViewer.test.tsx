import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../../src/renderer/App';
import { NotesProvider } from '../../../src/renderer/contexts/NotesContext';
import { ComponentsProvider } from '../../../src/renderer/contexts/ComponentsContext';
import { noteRepository, componentRepository } from '../../../src/database';

// Mock the contexts to spy on their methods
jest.mock('../../../src/database', () => ({
  noteRepository: {
    getAllNotes: jest.fn(),
    getNoteById: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
  },
  componentRepository: {
    getComponentsByNoteId: jest.fn(),
    getComponentById: jest.fn(),
    createComponent: jest.fn(),
    updateComponent: jest.fn(),
    deleteComponent: jest.fn(),
    createComponentVersion: jest.fn(),
    getComponentVersion: jest.fn(),
    getLatestComponentVersion: jest.fn(),
  },
  tagRepository: {
    getTagsForNote: jest.fn(),
    addTagToNote: jest.fn(),
    removeTagFromNote: jest.fn(),
  },
}));

// Mock Allotment since it uses DOM APIs not available in Jest
jest.mock('allotment', () => {
  return {
    Allotment: ({ children }: any) => <div data-testid="mock-allotment">{children}</div>,
  };
});

describe('Integration: Note Manager to Component Viewer Workflow', () => {
  // Mock data for tests
  const mockNote = {
    id: 1,
    title: 'Test Note',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
  };

  const mockComponents = [
    {
      id: 1,
      noteId: 1,
      name: 'Test Markup Component',
      type: 'Markup',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
    },
    {
      id: 2,
      noteId: 1,
      name: 'Test Image Component',
      type: 'Image',
      createdAt: new Date('2025-01-03'),
      updatedAt: new Date('2025-01-04'),
    },
  ];

  const mockVersion = {
    id: 'v1',
    componentId: 1,
    content: '<p>Test content</p>',
    createdAt: new Date('2025-01-02'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock repository responses
    noteRepository.getAllNotes.mockResolvedValue([mockNote]);
    noteRepository.getNoteById.mockResolvedValue(mockNote);
    componentRepository.getComponentsByNoteId.mockResolvedValue(mockComponents);
    componentRepository.getComponentById.mockImplementation((id) => 
      Promise.resolve(mockComponents.find(c => c.id === id) || null)
    );
    componentRepository.getLatestComponentVersion.mockResolvedValue(mockVersion);
    componentRepository.createComponent.mockResolvedValue(3); // New component ID
    componentRepository.createComponentVersion.mockResolvedValue('v2');
  });

  test('End-to-end flow: select note, view component, edit and save', async () => {
    // Render the App with providers
    render(
      <NotesProvider>
        <ComponentsProvider>
          <App />
        </ComponentsProvider>
      </NotesProvider>
    );

    // 1. Switch to Note Manager view
    const noteManagerButton = screen.getByRole('button', { name: /note manager/i });
    fireEvent.click(noteManagerButton);

    // Wait for notes to load
    await waitFor(() => {
      expect(noteRepository.getAllNotes).toHaveBeenCalled();
    });
    
    // 2. Select a note from the list
    const noteElement = await screen.findByText('Test Note');
    fireEvent.click(noteElement);
    
    // Wait for note selection and component loading
    await waitFor(() => {
      expect(noteRepository.getNoteById).toHaveBeenCalledWith(1);
      expect(componentRepository.getComponentsByNoteId).toHaveBeenCalledWith(1);
    });
    
    // 3. Verify note details are displayed
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    
    // 4. Verify components are listed
    expect(screen.getByText('Test Markup Component')).toBeInTheDocument();
    
    // 5. Select a component
    fireEvent.click(screen.getByText('Test Markup Component'));
    
    // Wait for component selection and loading
    await waitFor(() => {
      expect(componentRepository.getComponentById).toHaveBeenCalledWith(1);
      expect(componentRepository.getLatestComponentVersion).toHaveBeenCalled();
    });
    
    // 6. Verify component viewer is showing the component
    // Note: The actual implementation might vary based on how the viewer is structured
    const componentViewer = await screen.findByText(/test content/i);
    expect(componentViewer).toBeInTheDocument();
    
    // 7. Edit the component
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    // 8. Modify content in the editor
    // Find the textarea that appears in edit mode
    const editor = await screen.findByRole('textbox');
    fireEvent.change(editor, { target: { value: '<p>Updated content</p>' } });
    
    // 9. Save the changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Verify save was called
    await waitFor(() => {
      expect(componentRepository.createComponentVersion).toHaveBeenCalledWith(
        1, 
        '<p>Updated content</p>'
      );
    });
  });

  test('End-to-end flow: create new component, verify it appears in the list', async () => {
    // Render the App with providers
    render(
      <NotesProvider>
        <ComponentsProvider>
          <App />
        </ComponentsProvider>
      </NotesProvider>
    );

    // 1. Switch to Note Manager view
    const noteManagerButton = screen.getByRole('button', { name: /note manager/i });
    fireEvent.click(noteManagerButton);

    // Wait for notes to load and select a note
    await waitFor(() => {
      expect(noteRepository.getAllNotes).toHaveBeenCalled();
    });
    
    const noteElement = await screen.findByText('Test Note');
    fireEvent.click(noteElement);
    
    // Wait for component loading
    await waitFor(() => {
      expect(componentRepository.getComponentsByNoteId).toHaveBeenCalledWith(1);
    });
    
    // 2. Click add component button
    const addButton = screen.getByTitle('Add component');
    fireEvent.click(addButton);
    
    // 3. Fill out the component creation form
    const nameInput = screen.getByLabelText('Name:');
    fireEvent.change(nameInput, { target: { value: 'New Test Component' } });
    
    const typeSelect = screen.getByLabelText('Type:');
    fireEvent.change(typeSelect, { target: { value: 'Markup' } });
    
    // 4. Submit the form
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);
    
    // Verify component creation
    await waitFor(() => {
      expect(componentRepository.createComponent).toHaveBeenCalledWith(
        {
          noteId: 1,
          name: 'New Test Component',
          type: 'Markup',
        }, 
        expect.any(String)
      );
    });
    
    // Mock the getComponentsByNoteId to include the new component
    const updatedMockComponents = [
      ...mockComponents,
      {
        id: 3,
        noteId: 1,
        name: 'New Test Component',
        type: 'Markup',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    componentRepository.getComponentsByNoteId.mockResolvedValue(updatedMockComponents);
    
    // 5. Verify the new component appears in the list
    // This would happen after reloading components, which we've mocked above
    await waitFor(() => {
      expect(screen.getByText('New Test Component')).toBeInTheDocument();
    });
  });

  test('Error handling: should display error when component loading fails', async () => {
    // Mock a failure for component loading
    componentRepository.getComponentsByNoteId.mockRejectedValue(new Error('Failed to load components'));
    
    // Render the App with providers
    render(
      <NotesProvider>
        <ComponentsProvider>
          <App />
        </ComponentsProvider>
      </NotesProvider>
    );

    // Switch to Note Manager view
    const noteManagerButton = screen.getByRole('button', { name: /note manager/i });
    fireEvent.click(noteManagerButton);

    // Select a note
    const noteElement = await screen.findByText('Test Note');
    fireEvent.click(noteElement);
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load components/i)).toBeInTheDocument();
    });
    
    // Verify retry button exists
    const retryButton = screen.getByTitle('Retry');
    expect(retryButton).toBeInTheDocument();
    
    // Fix the mock for retry
    componentRepository.getComponentsByNoteId.mockResolvedValue(mockComponents);
    
    // Click retry
    fireEvent.click(retryButton);
    
    // Verify components load after retry
    await waitFor(() => {
      expect(screen.getByText('Test Markup Component')).toBeInTheDocument();
    });
  });
});