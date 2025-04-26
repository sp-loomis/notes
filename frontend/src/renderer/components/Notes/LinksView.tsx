import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { fetchNotes, setCurrentNote } from '../../store/notesSlice';
import { VscRefresh, VscError } from 'react-icons/vsc';

const LinksContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const LinksHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
`;

const LinksTitle = styled.h2`
  font-size: 14px;
  font-weight: normal;
`;

const LinksContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 8px;
`;

const NoteCard = styled.div`
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 3px;
  background-color: var(--secondary-color);
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-color);
  }
`;

const NoteLinksList = styled.div`
  margin-top: 5px;
  font-size: 12px;
`;

const NoteLink = styled.div`
  display: flex;
  align-items: center;
  padding: 3px 5px;
  margin-left: 10px;
  border-left: 2px solid var(--border-color);
  
  .link-type {
    color: var(--text-color);
    opacity: 0.7;
    margin-right: 5px;
  }
  
  .link-title {
    flex: 1;
  }
  
  &:hover {
    background-color: var(--hover-color);
  }
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

const LinksView: React.FC = () => {
  const dispatch = useDispatch();
  const { notes, status, error } = useSelector((state: RootState) => state.notes);
  
  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);
  
  // Filter notes that have links
  const notesWithLinks = notes.filter(note => note.links.length > 0);
  
  // Create a map of note IDs to note objects for quick lookup
  const noteMap = notes.reduce((map, note) => {
    map[note.id] = note;
    return map;
  }, {} as Record<string, Note>);
  
  const handleRefresh = () => {
    dispatch(fetchNotes());
  };
  
  const handleSelectNote = (note: Note) => {
    dispatch(setCurrentNote(note));
  };
  
  const getNoteTitleById = (id: string): string => {
    return noteMap[id]?.title || 'Unknown Note';
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
    <LinksContainer>
      <LinksHeader>
        <LinksTitle>Linked Notes</LinksTitle>
        <button onClick={handleRefresh} title="Refresh">
          <VscRefresh />
        </button>
      </LinksHeader>
      
      <LinksContent>
        {notesWithLinks.length === 0 ? (
          <p>No linked notes found. Create links between notes to see them here.</p>
        ) : (
          notesWithLinks.map(note => (
            <NoteCard key={note.id} onClick={() => handleSelectNote(note)}>
              <div>{note.title}</div>
              <NoteLinksList>
                {note.links.map((link, index) => (
                  <NoteLink key={`${note.id}-${link.targetId}-${index}`}>
                    <span className="link-type">{link.type}:</span>
                    <span className="link-title">{getNoteTitleById(link.targetId)}</span>
                  </NoteLink>
                ))}
              </NoteLinksList>
            </NoteCard>
          ))
        )}
      </LinksContent>
    </LinksContainer>
  );
};

export default LinksView;