import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { fetchNotes, setCurrentNote } from '../../store/notesSlice';
import { setEditorMode } from '../../store/uiSlice';
import { VscAdd, VscRefresh, VscError } from 'react-icons/vsc';
import { formatDate } from '../../utils/dateUtils';

const NotesListContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const NotesListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
`;

const NotesListTitle = styled.h2`
  font-size: 14px;
  font-weight: normal;
`;

const NotesListActions = styled.div`
  display: flex;
  gap: 5px;
`;

const NotesGrid = styled.div`
  flex: 1;
  overflow: auto;
  padding: 8px;
`;

const NoteCard = styled.div<{ active: boolean }>`
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 3px;
  background-color: ${props => props.active ? 'var(--selection-color)' : 'var(--secondary-color)'};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--selection-color)' : 'var(--hover-color)'};
  }
`;

const NoteTitle = styled.h3`
  font-size: 14px;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoteExcerpt = styled.div`
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
`;

const NoteMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-color);
  opacity: 0.6;
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 5px 0;
`;

const Tag = styled.span<{ color?: string }>`
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 3px;
  background-color: ${props => props.color || '#666'};
  color: #fff;
`;

const LoadingOrError = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex-direction: column;
  color: var(--text-color);
  gap: 10px;
  
  p {
    font-size: 12px;
  }
`;

const NotesList: React.FC = () => {
  const dispatch = useDispatch();
  const { notes, currentNote, status, error } = useSelector((state: RootState) => state.notes);
  const tags = useSelector((state: RootState) => state.tags.tags);
  
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNotes());
    }
  }, [dispatch, status]);
  
  const handleRefresh = () => {
    dispatch(fetchNotes());
  };
  
  const handleCreateNote = () => {
    dispatch(setEditorMode('create'));
  };
  
  const handleSelectNote = (note: Note) => {
    dispatch(setCurrentNote(note));
  };
  
  // Function to find tag colors
  const getTagColor = (tagName: string): string | undefined => {
    const tag = tags.find(t => t.name === tagName);
    return tag?.color;
  };
  
  // Render loading state
  if (status === 'loading' && notes.length === 0) {
    return (
      <LoadingOrError>
        <p>Loading notes...</p>
      </LoadingOrError>
    );
  }
  
  // Render error state
  if (status === 'failed') {
    return (
      <LoadingOrError>
        <VscError size={24} />
        <p>{error || 'Failed to load notes'}</p>
        <button onClick={handleRefresh}>Retry</button>
      </LoadingOrError>
    );
  }
  
  return (
    <NotesListContainer>
      <NotesListHeader>
        <NotesListTitle>Notes ({notes.length})</NotesListTitle>
        <NotesListActions>
          <button onClick={handleRefresh} title="Refresh">
            <VscRefresh />
          </button>
          <button onClick={handleCreateNote} title="New Note">
            <VscAdd />
          </button>
        </NotesListActions>
      </NotesListHeader>
      
      <NotesGrid>
        {notes.length === 0 ? (
          <p>No notes found. Create your first note!</p>
        ) : (
          notes.map(note => (
            <NoteCard 
              key={note.id} 
              active={currentNote?.id === note.id}
              onClick={() => handleSelectNote(note)}
            >
              <NoteTitle>{note.title}</NoteTitle>
              
              {note.tags.length > 0 && (
                <TagsList>
                  {note.tags.map(tag => (
                    <Tag key={tag} color={getTagColor(tag)}>
                      {tag}
                    </Tag>
                  ))}
                </TagsList>
              )}
              
              <NoteExcerpt>
                {note.content.plainText ? note.content.plainText.substring(0, 100) : 'No content'}
              </NoteExcerpt>
              
              <NoteMeta>
                <span>Updated: {formatDate(note.updatedAt)}</span>
                {note.links.length > 0 && (
                  <span>{note.links.length} links</span>
                )}
              </NoteMeta>
            </NoteCard>
          ))
        )}
      </NotesGrid>
    </NotesListContainer>
  );
};

export default NotesList;