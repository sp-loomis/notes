import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateNote, deleteNote, fetchLinkedNotes } from '../../store/notesSlice';
import { fetchTags } from '../../store/tagsSlice';
import { setEditorMode } from '../../store/uiSlice';
import { VscEdit, VscTrash, VscLinkExternal, VscClose, VscChevronDown, VscChevronRight } from 'react-icons/vsc';
import { formatDate } from '../../utils/dateUtils';

const NoteViewerContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid var(--border-color);
`;

const NoteTitle = styled.h1`
  font-size: 20px;
  margin: 0;
`;

const NoteActions = styled.div`
  display: flex;
  gap: 8px;
`;

const NoteContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 15px;
  font-size: 14px;
  line-height: 1.6;
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 10px 0;
`;

const Tag = styled.span<{ color?: string }>`
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 3px;
  background-color: ${props => props.color || '#666'};
  color: #fff;
`;

const NoteMeta = styled.div`
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.7;
  margin: 10px 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--text-color);
  opacity: 0.7;
  
  h2 {
    margin-bottom: 10px;
  }
  
  p {
    margin-bottom: 20px;
  }
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 20px;
  width: 350px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
  }
  
  p {
    margin-bottom: 20px;
  }
  
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const LinkedNotesSection = styled.div`
  margin-top: 20px;
  border-top: 1px solid var(--border-color);
  padding-top: 15px;
`;

const LinkedNotesHeader = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 5px 0;
  
  &:hover {
    color: var(--primary-color);
  }
  
  svg {
    transition: transform 0.2s ease;
    transform: ${props => props.$expanded ? 'rotate(90deg)' : 'rotate(0)'};
  }
`;

const LinkedNotesList = styled.div<{ $expanded: boolean }>`
  display: ${props => props.$expanded ? 'block' : 'none'};
  margin-top: 10px;
`;

const LinkedNoteItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 3px;
  margin-bottom: 5px;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  .link-type {
    font-size: 11px;
    color: var(--text-color);
    opacity: 0.7;
    margin-right: 5px;
  }
  
  a {
    flex: 1;
  }
`;

const NoteViewer: React.FC = () => {
  const dispatch = useDispatch();
  const { currentNote, linkedNotes, status } = useSelector((state: RootState) => state.notes);
  const tags = useSelector((state: RootState) => state.tags.tags);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [linkedNotesExpanded, setLinkedNotesExpanded] = useState(false);
  
  React.useEffect(() => {
    dispatch(fetchTags());
    
    if (currentNote) {
      dispatch(fetchLinkedNotes(currentNote.id));
    }
  }, [dispatch, currentNote]);
  
  // Function to find tag colors
  const getTagColor = (tagName: string): string | undefined => {
    const tag = tags.find(t => t.name === tagName);
    return tag?.color;
  };
  
  const handleEditNote = () => {
    dispatch(setEditorMode('edit'));
  };
  
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (currentNote) {
      dispatch(deleteNote(currentNote.id));
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };
  
  const toggleLinkedNotes = () => {
    setLinkedNotesExpanded(!linkedNotesExpanded);
  };
  
  // If no note is selected, show an empty state
  if (!currentNote) {
    return (
      <EmptyState>
        <h2>No Note Selected</h2>
        <p>Select a note from the sidebar or create a new one</p>
        <button onClick={() => dispatch(setEditorMode('create'))}>Create New Note</button>
      </EmptyState>
    );
  }
  
  return (
    <NoteViewerContainer>
      <NoteHeader>
        <NoteTitle>{currentNote.title}</NoteTitle>
        <NoteActions>
          <button onClick={handleEditNote} title="Edit Note">
            <VscEdit />
          </button>
          <button onClick={handleDeleteClick} title="Delete Note">
            <VscTrash />
          </button>
        </NoteActions>
      </NoteHeader>
      
      <NoteContent>
        {currentNote.tags.length > 0 && (
          <TagsList>
            {currentNote.tags.map(tag => (
              <Tag key={tag} color={getTagColor(tag)}>
                {tag}
              </Tag>
            ))}
          </TagsList>
        )}
        
        <NoteMeta>
          <div>Created: {formatDate(currentNote.createdAt)}</div>
          <div>Updated: {formatDate(currentNote.updatedAt)}</div>
        </NoteMeta>
        
        <div dangerouslySetInnerHTML={{ 
          __html: currentNote.content.html || 
                  (currentNote.content.plainText ? `<p>${currentNote.content.plainText}</p>` : 'No content') 
        }} />
        
        {status !== 'loading' && (
          <LinkedNotesSection>
            <LinkedNotesHeader 
              $expanded={linkedNotesExpanded} 
              onClick={toggleLinkedNotes}
            >
              {linkedNotesExpanded ? <VscChevronDown /> : <VscChevronRight />}
              <span>Linked Notes ({linkedNotes.length + currentNote.links.length})</span>
            </LinkedNotesHeader>
            
            <LinkedNotesList $expanded={linkedNotesExpanded}>
              <h4>Outgoing Links</h4>
              {currentNote.links.length === 0 ? (
                <p>No outgoing links</p>
              ) : (
                currentNote.links.map(link => (
                  <LinkedNoteItem key={link.targetId}>
                    <span className="link-type">{link.type}:</span>
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      // Logic to navigate to the linked note
                    }}>
                      {/* In a real app, we'd fetch the note title here */}
                      {link.targetId}
                    </a>
                    <button 
                      className="icon"
                      title="Remove Link"
                      onClick={() => {
                        // Remove link logic
                        const updatedLinks = currentNote.links.filter(l => l.targetId !== link.targetId);
                        dispatch(updateNote({ 
                          id: currentNote.id, 
                          noteData: { links: updatedLinks } 
                        }));
                      }}
                    >
                      <VscClose />
                    </button>
                  </LinkedNoteItem>
                ))
              )}
              
              <h4>Incoming Links</h4>
              {linkedNotes.length === 0 ? (
                <p>No incoming links</p>
              ) : (
                linkedNotes.map(note => {
                  const link = note.links.find(l => l.targetId === currentNote?.id);
                  return (
                    <LinkedNoteItem key={note.id}>
                      <span className="link-type">{link?.type || 'related'}:</span>
                      <a href="#" onClick={(e) => {
                        e.preventDefault();
                        // Logic to navigate to the source note
                      }}>
                        {note.title}
                      </a>
                      <button className="icon" title="Go to Note">
                        <VscLinkExternal />
                      </button>
                    </LinkedNoteItem>
                  );
                })
              )}
            </LinkedNotesList>
          </LinkedNotesSection>
        )}
      </NoteContent>
      
      {isDeleteDialogOpen && (
        <>
          <Backdrop onClick={handleDeleteCancel} />
          <ConfirmDialog>
            <h3>Delete Note</h3>
            <p>Are you sure you want to delete "{currentNote.title}"? This action cannot be undone.</p>
            <div className="actions">
              <button className="secondary" onClick={handleDeleteCancel}>Cancel</button>
              <button onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </ConfirmDialog>
        </>
      )}
    </NoteViewerContainer>
  );
};

export default NoteViewer;