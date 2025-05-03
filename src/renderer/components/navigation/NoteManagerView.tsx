import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiNotebook, mdiPlus, mdiRefresh, mdiAlert } from '@mdi/js';
import { useNotes } from '../../contexts/NotesContext';
import { useComponents } from '../../contexts/ComponentsContext';

const NoteManagerView: React.FC = () => {
  const { notes, selectedNote, loading, error, selectNote, createNote, refreshNotes } = useNotes();
  const { components, loadComponentsForNote } = useComponents();
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  // Handle note selection
  const handleSelectNote = async (noteId: number) => {
    await selectNote(noteId);
    // Load components for the selected note
    await loadComponentsForNote(noteId);
  };

  // Handle new note creation
  const handleCreateNote = async () => {
    if (newNoteTitle.trim()) {
      const noteId = await createNote({ title: newNoteTitle.trim() });
      if (noteId > 0) {
        setNewNoteTitle('');
        setIsCreating(false);
        await handleSelectNote(noteId);
      }
    }
  };

  // Handle note creation form submission
  const handleCreateFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateNote();
  };

  // Render loading state
  if (loading) {
    return (
      <div className="navigator-view note-manager-view">
        <div className="navigator-header">Note Manager</div>
        <div className="navigator-content">
          <div className="loading-indicator">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="navigator-view note-manager-view">
        <div className="navigator-header">Note Manager</div>
        <div className="navigator-content">
          <div className="error-message">
            <Icon path={mdiAlert} size={1} />
            <p>{error}</p>
            <button onClick={() => refreshNotes()} className="refresh-button">
              <Icon path={mdiRefresh} size={0.8} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state (no selected note)
  if (!selectedNote) {
    return (
      <div className="navigator-view note-manager-view">
        <div className="navigator-header">
          Note Manager
          <button
            className="create-note-button"
            onClick={() => setIsCreating(true)}
            aria-label="Create new note"
          >
            <Icon path={mdiPlus} size={1} />
          </button>
        </div>
        <div className="navigator-content">
          {isCreating ? (
            // New note creation form
            <div className="note-creation-form">
              <form onSubmit={handleCreateFormSubmit}>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Enter note title"
                  autoFocus
                />
                <div className="form-actions">
                  <button type="button" onClick={() => setIsCreating(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={!newNoteTitle.trim()} className="primary-button">
                    Create
                  </button>
                </div>
              </form>
            </div>
          ) : notes.length > 0 ? (
            // Note list
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
          ) : (
            // No notes placeholder
            <div className="placeholder">
              <Icon path={mdiNotebook} size={2} />
              <h3>No Notes Yet</h3>
              <p>Create your first note to get started</p>
              <button onClick={() => setIsCreating(true)} className="primary-button">
                Create Note
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render selected note view (placeholder for now)
  return (
    <div className="navigator-view note-manager-view">
      <div className="navigator-header">
        Note Manager
        <button
          className="create-note-button"
          onClick={() => {
            selectNote(-1); // Deselect current note
            setIsCreating(true);
          }}
          aria-label="Create new note"
        >
          <Icon path={mdiPlus} size={1} />
        </button>
      </div>
      <div className="navigator-content with-note">
        {/* This is a placeholder for the selected note view */}
        {/* Will be replaced with NoteAttributesPanel and ComponentListingPanel in future sprints */}
        <div className="selected-note-placeholder">
          <h3>{selectedNote.title}</h3>
          <p>Selected Note ID: {selectedNote.id}</p>
          <p>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</p>
          <p>Updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}</p>
          <button
            onClick={() => selectNote(-1)} // Deselect current note
            className="secondary-button"
          >
            Back to Note List
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteManagerView;
