import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentViewer from '../../../../src/renderer/components/componentViewer/ComponentViewer';
import ComponentsContext from '../../../../src/renderer/contexts/ComponentsContext';
import { ComponentType } from '../../../../src/database/models/component';

// Mock the ComponentHeader component
jest.mock('../../../../src/renderer/components/componentViewer/ComponentHeader', () => {
  return function MockComponentHeader({ 
    name, 
    isEditing, 
    onEditToggle, 
    onClose, 
    onVersionSelect 
  }: { 
    name: string;
    isEditing: boolean;
    onEditToggle: () => void;
    onClose: () => void;
    onVersionSelect: (versionId: string) => void;
  }) {
    return (
      <div data-testid="component-header">
        <h3>{name}</h3>
        <button
          data-testid="edit-toggle-button"
          onClick={onEditToggle}
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
        <button
          data-testid="close-button"
          onClick={onClose}
        >
          Close
        </button>
        <select 
          data-testid="version-selector"
          onChange={(e) => onVersionSelect(e.target.value)}
        >
          <option value="v1">Version 1</option>
        </select>
      </div>
    );
  };
});

// Mock the viewer components
jest.mock('../../../../src/renderer/components/componentViewer/viewers/MarkupViewer', () => {
  return function MockMarkupViewer({ content }: { content: string }) {
    return <div className="markup-viewer"><div className="markup-content">{content}</div></div>;
  };
});

jest.mock('../../../../src/renderer/components/componentViewer/viewers/ImageViewer', () => {
  return function MockImageViewer({ content }: { content: string }) {
    return <div className="image-viewer"><div className="image-display"><img src={content} alt="Component content" /></div></div>;
  };
});

jest.mock('../../../../src/renderer/components/componentViewer/viewers/GeoJSONViewer', () => {
  return function MockGeoJSONViewer({ content }: { content: string }) {
    return <div className="geojson-viewer">{content}</div>;
  };
});

jest.mock('../../../../src/renderer/components/componentViewer/viewers/TLDrawViewer', () => {
  return function MockTLDrawViewer({ content }: { content: string }) {
    return <div className="tldraw-viewer">{content}</div>;
  };
});

// Jest timer mocks
jest.useFakeTimers();

describe('ComponentViewer', () => {
  // Mock component and version
  const mockComponent = {
    id: 1,
    noteId: 100,
    name: 'Test Component',
    type: ComponentType.Markup,
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2023-05-02')
  };

  const mockVersion = {
    id: 'v1',
    componentId: 1,
    content: '<p>Test content</p>',
    createdAt: new Date('2023-05-02')
  };

  // Mock context functions
  const mockLoadComponentVersion = jest.fn();
  const mockUpdateComponentContent = jest.fn();
  const mockSelectComponent = jest.fn();

  // Define context value type to match ComponentsContextType
  type MockContextType = {
    selectedComponent: typeof mockComponent | null;
    selectedVersion: typeof mockVersion | null;
    loading: boolean;
    error: null | string;
    loadComponentVersion: typeof mockLoadComponentVersion;
    updateComponentContent: typeof mockUpdateComponentContent;
    selectComponent: typeof mockSelectComponent;
    components: Array<any>;
    loadComponentsForNote: jest.Mock;
    loadLatestVersion: jest.Mock;
    createComponent: jest.Mock;
    updateComponent: jest.Mock;
    deleteComponent: jest.Mock;
  };

  // Helper to create a wrapper with context
  const renderWithContext = (
    contextValue: MockContextType = {
      selectedComponent: mockComponent,
      selectedVersion: mockVersion,
      loading: false,
      error: null,
      loadComponentVersion: mockLoadComponentVersion,
      updateComponentContent: mockUpdateComponentContent,
      selectComponent: mockSelectComponent,
      components: [],
      loadComponentsForNote: jest.fn(),
      loadLatestVersion: jest.fn(),
      createComponent: jest.fn(),
      updateComponent: jest.fn(),
      deleteComponent: jest.fn()
    }
  ) => {
    return render(
      <ComponentsContext.Provider value={contextValue}>
        <ComponentViewer />
      </ComponentsContext.Provider>
    );
  };

  beforeEach(() => {
    // Reset mocks
    mockLoadComponentVersion.mockReset();
    mockUpdateComponentContent.mockReset();
    mockSelectComponent.mockReset();
    
    // Setup successful mocks
    mockLoadComponentVersion.mockResolvedValue(true);
    mockUpdateComponentContent.mockResolvedValue('v2');
    mockSelectComponent.mockResolvedValue(true);
  });

  test('shows placeholder when no component is selected', () => {
    renderWithContext({ 
      selectedComponent: null, 
      selectedVersion: null,
      loading: false,
      error: null,
      loadComponentVersion: mockLoadComponentVersion,
      updateComponentContent: mockUpdateComponentContent,
      selectComponent: mockSelectComponent,
      components: [],
      loadComponentsForNote: jest.fn(),
      loadLatestVersion: jest.fn(),
      createComponent: jest.fn(),
      updateComponent: jest.fn(),
      deleteComponent: jest.fn()
    });
    
    expect(screen.getByText('No Component Selected')).toBeInTheDocument();
    expect(screen.getByText('Select a component from the note components panel to view its content.')).toBeInTheDocument();
  });

  test('renders component header when component is selected', () => {
    renderWithContext();
    
    // Check if component header is rendered
    expect(screen.getByTestId('component-header')).toBeInTheDocument();
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  test('toggles edit mode when edit button is clicked', async () => {
    renderWithContext();
    
    // Initially in view mode
    const editButton = screen.getByTestId('edit-toggle-button');
    expect(editButton).toHaveTextContent('Edit');
    
    // Click to enter edit mode
    fireEvent.click(editButton);
    
    // Now should be in edit mode with Save button
    expect(editButton).toHaveTextContent('Save');
    
    // Click to save and exit edit mode
    fireEvent.click(editButton);
    
    // Should call updateComponentContent
    await waitFor(() => {
      expect(mockUpdateComponentContent).toHaveBeenCalledWith(mockComponent.id, expect.any(String));
    });
  });

  test('closes component viewer when close button is clicked', () => {
    renderWithContext();
    
    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);
    
    // Should call selectComponent with 0 to clear selection
    jest.runAllTimers(); // Run the timeout
    expect(mockSelectComponent).toHaveBeenCalledWith(0);
  });

  test('loads different version when version selector changes', () => {
    renderWithContext();
    
    const versionSelector = screen.getByTestId('version-selector');
    fireEvent.change(versionSelector, { target: { value: 'v1' } });
    
    expect(mockLoadComponentVersion).toHaveBeenCalledWith('v1');
  });

  test('renders markup component content when selected', () => {
    renderWithContext();
    
    // Should render markup content in a markup viewer
    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(document.querySelector('.markup-viewer')).toBeInTheDocument();
    // Check just for the text content rather than HTML tags
    expect(document.querySelector('.markup-content')).toHaveTextContent('Test content');
  });

  test('renders different component types based on the selected component', () => {
    const imageComponent = {
      ...mockComponent,
      type: ComponentType.Image
    };
    
    const imageVersion = {
      ...mockVersion,
      content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
    };
    
    renderWithContext({
      selectedComponent: imageComponent,
      selectedVersion: imageVersion,
      loading: false,
      error: null,
      loadComponentVersion: mockLoadComponentVersion,
      updateComponentContent: mockUpdateComponentContent,
      selectComponent: mockSelectComponent,
      components: [],
      loadComponentsForNote: jest.fn(),
      loadLatestVersion: jest.fn(),
      createComponent: jest.fn(),
      updateComponent: jest.fn(),
      deleteComponent: jest.fn()
    });
    
    // Check if component header is rendered
    expect(screen.getByText('Test Component')).toBeInTheDocument();
    
    // Should render image viewer for image components
    expect(document.querySelector('.image-viewer')).toBeInTheDocument();
    const img = document.querySelector('.image-display img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', imageVersion.content);
  });
});
