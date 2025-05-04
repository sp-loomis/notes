import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComponentListingPanel from '../../../../src/renderer/components/noteManager/ComponentListingPanel';
import ComponentsContext from '../../../../src/renderer/contexts/ComponentsContext';
import { ComponentType } from '../../../../src/database/models/component';

// Mock the DeleteConfirmationModal component
jest.mock('../../../../src/renderer/components/common/DeleteConfirmationModal', () => {
  return function MockDeleteConfirmationModal({
    title,
    message,
    onConfirm,
    onCancel,
  }: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) {
    return (
      <div data-testid="delete-confirmation-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onConfirm} data-testid="confirm-delete-button">
          Confirm
        </button>
        <button onClick={onCancel} data-testid="cancel-delete-button">
          Cancel
        </button>
      </div>
    );
  };
});

// Mock component data
const mockComponents = [
  {
    id: 1,
    noteId: 1,
    name: 'Test Markup Component',
    type: ComponentType.Markup,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
  },
  {
    id: 2,
    noteId: 1,
    name: 'Test Image Component',
    type: ComponentType.Image,
    createdAt: new Date('2025-01-03'),
    updatedAt: new Date('2025-01-04'),
  },
  {
    id: 3,
    noteId: 1,
    name: 'Test GeoJSON Component',
    type: ComponentType.GeoJSON,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-06'),
  },
];

// Mock context value
const mockContextValue = {
  components: mockComponents,
  selectedComponent: null,
  selectedVersion: null,
  loading: false,
  error: null,
  loadComponentsForNote: jest.fn(),
  selectComponent: jest.fn(),
  loadComponentVersion: jest.fn(),
  loadLatestVersion: jest.fn(),
  createComponent: jest.fn(),
  updateComponent: jest.fn(),
  updateComponentContent: jest.fn(),
  deleteComponent: jest.fn(),
};

// Component wrapper with context
const renderWithContext = (ui: React.ReactElement, contextValue: any) => {
  return render(<ComponentsContext.Provider value={contextValue}>{ui}</ComponentsContext.Provider>);
};

describe('ComponentListingPanel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders empty state when no components', () => {
    const emptyContextValue = { ...mockContextValue, components: [] };
    renderWithContext(<ComponentListingPanel noteId={1} />, emptyContextValue);

    expect(screen.getByText('No components yet')).toBeInTheDocument();
    expect(screen.getByText('Create Component')).toBeInTheDocument();
  });

  test('renders loading state', () => {
    const loadingContextValue = { ...mockContextValue, loading: true };
    renderWithContext(<ComponentListingPanel noteId={1} />, loadingContextValue);

    expect(screen.getByText('Loading components...')).toBeInTheDocument();
  });

  test('renders error message', () => {
    const errorContextValue = { ...mockContextValue, error: 'Test error message' };
    renderWithContext(<ComponentListingPanel noteId={1} />, errorContextValue);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  test('renders list of components', () => {
    renderWithContext(<ComponentListingPanel noteId={1} />, mockContextValue);

    expect(screen.getByText('Test Markup Component')).toBeInTheDocument();
    expect(screen.getByText('Test Image Component')).toBeInTheDocument();
    expect(screen.getByText('Test GeoJSON Component')).toBeInTheDocument();
  });

  test('selects a component when clicked', () => {
    renderWithContext(<ComponentListingPanel noteId={1} />, mockContextValue);

    fireEvent.click(screen.getByText('Test Markup Component'));
    expect(mockContextValue.selectComponent).toHaveBeenCalledWith(1);
  });

  test('shows component creation form when add button is clicked', () => {
    renderWithContext(<ComponentListingPanel noteId={1} />, mockContextValue);

    fireEvent.click(screen.getByTitle('Add component'));
    expect(screen.getByText('New Component')).toBeInTheDocument();
    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Type:')).toBeInTheDocument();
  });

  test('creates a new component', async () => {
    // Setup the mock to resolve with a component ID
    mockContextValue.createComponent.mockResolvedValue(4);

    renderWithContext(<ComponentListingPanel noteId={1} />, mockContextValue);

    // Open form
    fireEvent.click(screen.getByTitle('Add component'));

    // Fill form
    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'New Test Component' } });
    const typeSelect = screen.getByLabelText('Type:');
    fireEvent.change(typeSelect, { target: { value: ComponentType.Markup } });

    // Submit form
    fireEvent.click(screen.getByText('Create'));

    // Verify component creation
    await waitFor(() => {
      expect(mockContextValue.createComponent).toHaveBeenCalledWith(
        {
          noteId: 1,
          name: 'New Test Component',
          type: ComponentType.Markup,
        },
        '<p>Start writing here...</p>'
      );
    });

    await waitFor(() => {
      expect(mockContextValue.selectComponent).toHaveBeenCalledWith(4);
    });
  });

  test('handles component renaming', async () => {
    mockContextValue.updateComponent.mockResolvedValue(true);
    renderWithContext(<ComponentListingPanel noteId={1} />, mockContextValue);

    // Find the component item and start editing
    const componentItem = screen.getByText('Test Markup Component').closest('li');
    if (!componentItem) throw new Error('Component item not found');

    // Click the rename button (first we need to find it without hovering)
    const editButtons = screen.getAllByTitle('Rename');
    fireEvent.click(editButtons[0]);

    // Change name in the input field
    const input = screen.getByDisplayValue('Test Markup Component');
    fireEvent.change(input, { target: { value: 'Updated Component Name' } });

    // Find the save button and click it
    const saveButton = screen.getByTitle('Save');
    fireEvent.click(saveButton);

    // Verify component update was called
    await waitFor(() => {
      expect(mockContextValue.updateComponent).toHaveBeenCalledWith(1, {
        name: 'Updated Component Name',
      });
    });
  });

  test('cancels component name editing', async () => {
    renderWithContext(<ComponentListingPanel noteId={1} />, mockContextValue);

    // Find the component item and start editing
    const editButtons = screen.getAllByTitle('Rename');
    fireEvent.click(editButtons[0]);

    // Verify input field is shown
    const input = screen.getByDisplayValue('Test Markup Component');
    expect(input).toBeInTheDocument();

    // Find and click the cancel button
    const cancelButton = screen.getByTitle('Cancel');
    fireEvent.click(cancelButton);

    // Verify we're no longer in edit mode
    expect(screen.queryByDisplayValue('Test Markup Component')).not.toBeInTheDocument();
    // Verify updateComponent was not called
    expect(mockContextValue.updateComponent).not.toHaveBeenCalled();
  });

  test('shows delete confirmation when delete button is clicked', () => {
    renderWithContext(<ComponentListingPanel noteId={1} />, mockContextValue);

    // Find and click the delete button
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    // Verify delete confirmation is shown
    expect(screen.getByTestId('delete-confirmation-modal')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete the component/)).toBeInTheDocument();
  });

  test('deletes a component when confirmed', async () => {
    mockContextValue.deleteComponent.mockResolvedValue(true);
    renderWithContext(<ComponentListingPanel noteId={1} />, mockContextValue);

    // Find and click the delete button
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    // Find and click the confirm button in the modal
    const confirmButton = screen.getByTestId('confirm-delete-button');
    fireEvent.click(confirmButton);

    // Verify deleteComponent was called
    await waitFor(() => {
      expect(mockContextValue.deleteComponent).toHaveBeenCalledWith(1);
    });
  });

  test('cancels component deletion', () => {
    renderWithContext(<ComponentListingPanel noteId={1} />, mockContextValue);

    // Find and click the delete button
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    // Find and click the cancel button in the modal
    const cancelButton = screen.getByTestId('cancel-delete-button');
    fireEvent.click(cancelButton);

    // Verify deleteComponent was not called
    expect(mockContextValue.deleteComponent).not.toHaveBeenCalled();
  });

  test('displays component type icons', () => {
    renderWithContext(<ComponentListingPanel noteId={1} />, mockContextValue);

    // We can't easily check the exact icons, but we can verify that the icon container elements exist
    const iconContainers = screen.getAllByTestId('component-icon');
    expect(iconContainers.length).toBe(3); // One for each component
  });

  test('displays formatted date for components', () => {
    renderWithContext(<ComponentListingPanel noteId={1} />, mockContextValue);

    // The GitHub Workspace environment shows the date with timezone adjustment
    expect(screen.getByText(/Jan 2, 12:00 AM/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 4, 12:00 AM/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 6, 12:00 AM/)).toBeInTheDocument();
  });

  test('highlights selected component', () => {
    // Set the first component as selected
    const contextWithSelectedComponent = {
      ...mockContextValue,
      selectedComponent: mockComponents[0],
    };

    renderWithContext(<ComponentListingPanel noteId={1} />, contextWithSelectedComponent);

    // Find the component items
    const componentItems = screen.getAllByRole('listitem');

    // The first item should have the 'selected' class
    expect(componentItems[0]).toHaveClass('selected');
    // The others should not
    expect(componentItems[1]).not.toHaveClass('selected');
    expect(componentItems[2]).not.toHaveClass('selected');
  });
});
