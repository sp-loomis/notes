import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentHeader from '../../../../src/renderer/components/componentViewer/ComponentHeader';
import { ComponentVersion } from '../../../../src/database/models/component-version';

describe('ComponentHeader', () => {
  // Mock data
  const componentName = 'Test Component';
  const mockVersions: ComponentVersion[] = [
    {
      id: 'v1',
      componentId: 1,
      content: 'content v1',
      createdAt: new Date('2023-05-01T10:00:00.000Z')
    },
    {
      id: 'v2',
      componentId: 1,
      content: 'content v2',
      createdAt: new Date('2023-05-02T10:00:00.000Z')
    }
  ];
  
  // Mock handlers
  const mockEditToggle = jest.fn();
  const mockClose = jest.fn();
  const mockVersionSelect = jest.fn();

  // Default props
  const defaultProps = {
    name: componentName,
    isEditing: false,
    onEditToggle: mockEditToggle,
    onClose: mockClose,
    versions: mockVersions,
    selectedVersionId: 'v2',
    onVersionSelect: mockVersionSelect
  };

  beforeEach(() => {
    // Reset mocks
    mockEditToggle.mockReset();
    mockClose.mockReset();
    mockVersionSelect.mockReset();
  });

  test('renders component name correctly', () => {
    render(<ComponentHeader {...defaultProps} />);
    expect(screen.getByText(componentName)).toBeInTheDocument();
  });

  test('renders edit button in view mode', () => {
    render(<ComponentHeader {...defaultProps} />);
    const editButton = screen.getByTitle('Edit component');
    expect(editButton).toBeInTheDocument();
    
    fireEvent.click(editButton);
    expect(mockEditToggle).toHaveBeenCalledTimes(1);
  });

  test('renders save button in edit mode', () => {
    render(<ComponentHeader {...defaultProps} isEditing={true} />);
    const saveButton = screen.getByTitle('Save changes');
    expect(saveButton).toBeInTheDocument();
    
    fireEvent.click(saveButton);
    expect(mockEditToggle).toHaveBeenCalledTimes(1);
  });

  test('close button calls onClose handler', () => {
    render(<ComponentHeader {...defaultProps} />);
    const closeButton = screen.getByTitle('Close component');
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test('version selector shows available versions', () => {
    render(<ComponentHeader {...defaultProps} />);
    
    // Check if selector exists
    const selector = screen.getByRole('combobox');
    expect(selector).toBeInTheDocument();
    
    // Check if both versions are in the dropdown
    expect(selector.children.length).toBe(2);
    
    // Test version selection
    fireEvent.change(selector, { target: { value: 'v1' } });
    expect(mockVersionSelect).toHaveBeenCalledWith('v1');
  });

  test('version selector is disabled in edit mode', () => {
    render(<ComponentHeader {...defaultProps} isEditing={true} />);
    
    const selector = screen.getByRole('combobox');
    expect(selector).toBeDisabled();
  });

  test('handles empty versions array', () => {
    render(<ComponentHeader {...defaultProps} versions={[]} />);
    
    // Version selector should not be rendered when no versions
    const selector = screen.queryByRole('combobox');
    expect(selector).not.toBeInTheDocument();
  });
});
