import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/renderer/App';

// Mock the Allotment component
jest.mock('allotment');

describe('App Component', () => {
  test('renders the tab bar and navigator panel', () => {
    render(<App />);
    
    // Check that the tab bar is rendered with the correct buttons
    const searchButton = screen.getByRole('button', { name: /search notes/i });
    expect(searchButton).toBeInTheDocument();
    
    // Check that the Search view is shown by default
    // Use a more specific selector to avoid ambiguity
    const searchHeader = screen.getByText('Search Notes', { selector: '.navigator-header' });
    expect(searchHeader).toBeInTheDocument();
  });

  test('switches views when clicking tabs', () => {
    render(<App />);
    
    // Click the Notes tab
    const notesButton = screen.getByRole('button', { name: /note manager/i });
    fireEvent.click(notesButton);
    
    // Check that the Notes view is shown using a more specific selector
    const notesHeader = screen.getByText('Note Manager', { selector: '.navigator-header' });
    expect(notesHeader).toBeInTheDocument();
    
    // Click the Tags tab
    const tagsButton = screen.getByRole('button', { name: /tag organizer/i });
    fireEvent.click(tagsButton);
    
    // Check that the Tags view is shown using a more specific selector
    const tagsHeader = screen.getByText('Tag Organizer', { selector: '.navigator-header' });
    expect(tagsHeader).toBeInTheDocument();
  });
});
