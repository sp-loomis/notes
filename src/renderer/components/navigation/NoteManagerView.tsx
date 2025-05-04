import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiNotebook, mdiPlus, mdiRefresh, mdiAlert, mdiClose } from '@mdi/js';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { useNotes } from '../../contexts/NotesContext';
import { useComponents } from '../../contexts/ComponentsContext';
import NoteAttributesPanel from '../noteManager/NoteAttributesPanel';
import ComponentListingPanel from '../noteManager/ComponentListingPanel';

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

  // Handle closing the selected note
  const handleCloseNote = () => {
    selectNote(-1); // Deselect current note
  };

  // Render loading state
  if (loading) {
    return (
      <div className="navigator-view">
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
      <div className="navigator-view">
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
      <div className="navigator-view">
        <div className="navigator-header">
          Note Manager
          <button
            className="icon-button primary"
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
          ) : (
            // No note selected placeholder
            <div className="placeholder">
              <Icon path={mdiNotebook} size={2} />
              <h3>No Note Selected</h3>
              <p>Create a new note to get started</p>
              <button onClick={() => setIsCreating(true)} className="primary-button">
                Create Note
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render selected note view - with direct Allotment
  return (
    <>
      <div className="navigator-header note-manager-view">
        Note Manager
        <button className="icon-button secondary" onClick={handleCloseNote} aria-label="Close note">
          <Icon path={mdiClose} size={1} />
        </button>
      </div>
      <Allotment vertical defaultSizes={[60, 40]} className="note-manager-allotment">
        {/* Note Attributes Panel */}
        <Allotment.Pane preferredSize={250} minSize={150}>
          <NoteAttributesPanel onClose={handleCloseNote} />
        </Allotment.Pane>

        {/* Component Listing Panel */}
        <Allotment.Pane minSize={150}>
          <ComponentListingPanel noteId={selectedNote.id} />
        </Allotment.Pane>
      </Allotment>
    </>
  );
};

export default NoteManagerView;
