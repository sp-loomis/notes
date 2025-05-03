import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TabBar from '../../../../src/renderer/components/layout/TabBar';

describe('TabBar Component', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  test('renders all tabs correctly', () => {
    render(<TabBar activeTab="search" onTabChange={mockOnTabChange} />);
    // Check that we have all three tabs
    const searchButton = screen.getByRole('button', { name: /search notes/i });
    const notesButton = screen.getByRole('button', { name: /note manager/i });
    const tagsButton = screen.getByRole('button', { name: /tag organizer/i });
    expect(searchButton).toBeInTheDocument();
    expect(notesButton).toBeInTheDocument();
    expect(tagsButton).toBeInTheDocument();
  });

  test('applies active class to the active tab', () => {
    render(<TabBar activeTab="notes" onTabChange={mockOnTabChange} />);
    const searchButton = screen.getByRole('button', { name: /search notes/i });
    const notesButton = screen.getByRole('button', { name: /note manager/i });
    const tagsButton = screen.getByRole('button', { name: /tag organizer/i });
    // Check that the active class is applied correctly
    expect(searchButton.className).not.toContain('active');
    expect(notesButton.className).toContain('active');
    expect(tagsButton.className).not.toContain('active');
  });

  test('calls onTabChange when clicking a tab', () => {
    render(<TabBar activeTab="search" onTabChange={mockOnTabChange} />);
    const notesButton = screen.getByRole('button', { name: /note manager/i });
    // Click the notes tab
    fireEvent.click(notesButton);
    // Check that onTabChange was called with the correct ID
    expect(mockOnTabChange).toHaveBeenCalledWith('notes');
  });
});
