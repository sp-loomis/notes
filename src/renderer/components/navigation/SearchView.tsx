import React from 'react';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import { useNotes } from '../../contexts/NotesContext';
import { useComponents } from '../../contexts/ComponentsContext';

const SearchView: React.FC = () => {
  const { notes, selectNote } = useNotes();
  const { loadComponentsForNote } = useComponents();

  // Handle note selection
  const handleSelectNote = async (noteId: number) => {
    await selectNote(noteId);
    // Load components for the selected note
    await loadComponentsForNote(noteId);
  };

  return (
    <div className="navigator-view search-view">
      <div className="navigator-header">Search Notes</div>
      <div className="navigator-content">
        {notes.length > 0 ? (
          <div className="search-results">
            <div className="search-placeholder-message">
              <Icon path={mdiMagnify} size={1} />
              <p>Full search functionality will be implemented in Phase 6</p>
              <p>Showing all notes as a placeholder</p>
            </div>
            <div className="note-list">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="note-list-item"
                  onClick={() => handleSelectNote(note.id)}
                >
                  <div className="note-title">{note.title}</div>
                  <div className="note-dates">
                    <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="placeholder">
            <Icon path={mdiMagnify} size={2} />
            <h3>Search Notes</h3>
            <p>No notes found. Create a note in the Note Manager to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
