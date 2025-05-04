import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiPencil,
  mdiCheck,
  mdiClose,
  mdiDelete,
  mdiCalendar,
  mdiTag,
  mdiAlertCircle,
} from '@mdi/js';
import { useNotes } from '../../contexts/NotesContext';
import { useComponents } from '../../contexts/ComponentsContext';
import { Tag } from '../../../database/models/tag';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import TagSelector from '../common/TagSelector';
import { tagRepository } from '../../../database';

interface NoteAttributesPanelProps {
  onClose: () => void;
}

const NoteAttributesPanel: React.FC<NoteAttributesPanelProps> = ({ onClose }) => {
  const { selectedNote, updateNote, deleteNote, loading, error } = useNotes();
  const { components } = useComponents();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editError, setEditError] = useState<string | null>(null);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Load tags for the selected note
  useEffect(() => {
    const loadTags = async () => {
      if (!selectedNote) return;

      try {
        setTagsLoading(true);
        const noteTags = await tagRepository.getTagsForNote(selectedNote.id);
        setTags(noteTags);
      } catch (err) {
        setEditError(`Error loading tags: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setTagsLoading(false);
      }
    };

    if (selectedNote) {
      loadTags();
    }
  }, [selectedNote]);

  // Initialize edit form when entering edit mode
  const handleStartEditing = () => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setIsEditing(true);
      setEditError(null);
    }
  };

  // Cancel editing and revert changes
  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditError(null);
  };

  // Save note changes
  const handleSaveChanges = async () => {
    if (!selectedNote) return;

    try {
      setEditError(null);
      const success = await updateNote(selectedNote.id, { title: title.trim() });

      if (success) {
        setIsEditing(false);
      } else {
        setEditError('Failed to save note changes.');
      }
    } catch (err) {
      setEditError(`Error saving note: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Handle note deletion
  const handleDeleteNote = async () => {
    if (!selectedNote) return;

    try {
      const success = await deleteNote(selectedNote.id);

      if (success) {
        setShowDeleteConfirmation(false);
        onClose(); // Go back to "No Note Selected" view
      } else {
        setEditError('Failed to delete note.');
      }
    } catch (err) {
      setEditError(`Error deleting note: ${err instanceof Error ? err.message : String(err)}`);
      setShowDeleteConfirmation(false);
    }
  };

  // Handle adding a tag to the note
  const handleAddTag = async (tag: Tag) => {
    if (!selectedNote) return;

    try {
      const success = await tagRepository.addTagToNote(selectedNote.id, tag.id);
      if (success) {
        setTags((prevTags) => [...prevTags, tag]);
      } else {
        setEditError(`Failed to add tag '${tag.name}' to note.`);
      }
    } catch (err) {
      setEditError(`Error adding tag: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Handle removing a tag from the note
  const handleRemoveTag = async (tagId: number) => {
    if (!selectedNote) return;

    try {
      const success = await tagRepository.removeTagFromNote(selectedNote.id, tagId);
      if (success) {
        setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId));
      } else {
        setEditError('Failed to remove tag from note.');
      }
    } catch (err) {
      setEditError(`Error removing tag: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!selectedNote) {
    return null;
  }

  return (
    <div className="note-attributes-panel">
      <div className="panel-header">
        <h3>Note Details</h3>
        <div className="header-actions">
          {isEditing ? (
            <>
              <button
                className="icon-button success"
                onClick={handleSaveChanges}
                disabled={!title.trim() || loading}
                title="Save changes"
              >
                <Icon path={mdiCheck} size={0.9} />
              </button>
              <button
                className="icon-button secondary"
                onClick={handleCancelEditing}
                title="Cancel editing"
              >
                <Icon path={mdiClose} size={0.9} />
              </button>
            </>
          ) : (
            <button className="icon-button primary" onClick={handleStartEditing} title="Edit note">
              <Icon path={mdiPencil} size={0.9} />
            </button>
          )}
          <button
            className="icon-button danger"
            onClick={() => setShowDeleteConfirmation(true)}
            title="Delete note"
          >
            <Icon path={mdiDelete} size={0.9} />
          </button>
        </div>
      </div>

      {(error || editError) && (
        <div className="error-message">
          <Icon path={mdiAlertCircle} size={0.8} />
          <span>{error || editError}</span>
        </div>
      )}

      <div className="note-title-section">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            className="title-input"
            autoFocus
          />
        ) : (
          <h2 className="note-title">{selectedNote.title}</h2>
        )}
      </div>

      <div className="note-metadata">
        <div className="metadata-item">
          <Icon path={mdiCalendar} size={0.8} />
          <span>Created: {formatDate(selectedNote.createdAt)}</span>
        </div>
        <div className="metadata-item">
          <Icon path={mdiCalendar} size={0.8} />
          <span>Modified: {formatDate(selectedNote.updatedAt)}</span>
        </div>
        <div className="tags-section">
          <div className="section-header">
            <Icon path={mdiTag} size={0.8} />
            <span>Tags</span>
          </div>
          <TagSelector
            selectedTags={tags}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            isEditing={isEditing}
          />
        </div>
      </div>

      <div className="note-components-summary">
        <span>Components: {components.length}</span>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          title="Delete Note"
          message={`Are you sure you want to delete the note "${selectedNote.title}"? This action cannot be undone and will delete all components within this note.`}
          onConfirm={handleDeleteNote}
          onCancel={() => setShowDeleteConfirmation(false)}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default NoteAttributesPanel;
