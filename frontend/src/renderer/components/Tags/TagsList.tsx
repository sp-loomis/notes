import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { fetchTags, setCurrentTag, deleteTag } from '../../store/tagsSlice';
import { fetchNotesByTag } from '../../store/notesSlice';
import { VscAdd, VscRefresh, VscError, VscTrash } from 'react-icons/vsc';

const TagsListContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TagsListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
`;

const TagsListTitle = styled.h2`
  font-size: 14px;
  font-weight: normal;
`;

const TagsListActions = styled.div`
  display: flex;
  gap: 5px;
`;

const TagsGrid = styled.div`
  flex: 1;
  overflow: auto;
  padding: 8px;
`;

const TagItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  margin-bottom: 5px;
  border-radius: 3px;
  background-color: var(--secondary-color);
  
  &:hover {
    background-color: var(--hover-color);
  }
`;

const TagName = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  &::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => props.color || '#666'};
    margin-right: 8px;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const TagCount = styled.div`
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.7;
`;

const TagActions = styled.div`
  display: flex;
  gap: 5px;
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

const TagsList: React.FC = () => {
  const dispatch = useDispatch();
  const { tags, status, error } = useSelector((state: RootState) => state.tags);
  const notes = useSelector((state: RootState) => state.notes.notes);
  const [tagToDelete, setTagToDelete] = React.useState<Tag | null>(null);
  
  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);
  
  const handleRefresh = () => {
    dispatch(fetchTags());
  };
  
  const handleCreateTag = () => {
    // This will be handled by the TagForm component
    console.log('Create tag');
  };
  
  const handleTagClick = (tag: Tag) => {
    dispatch(setCurrentTag(tag));
    dispatch(fetchNotesByTag(tag.name));
  };
  
  const handleDeleteClick = (tag: Tag, e: React.MouseEvent) => {
    e.stopPropagation();
    setTagToDelete(tag);
  };
  
  const handleDeleteConfirm = () => {
    if (tagToDelete) {
      dispatch(deleteTag(tagToDelete.id));
      setTagToDelete(null);
    }
  };
  
  const handleDeleteCancel = () => {
    setTagToDelete(null);
  };
  
  // Count notes for each tag
  const getTagCount = (tagName: string): number => {
    return notes.filter(note => note.tags.includes(tagName)).length;
  };
  
  // Render loading state
  if (status === 'loading' && tags.length === 0) {
    return (
      <LoadingOrError>
        <p>Loading tags...</p>
      </LoadingOrError>
    );
  }
  
  // Render error state
  if (status === 'failed') {
    return (
      <LoadingOrError>
        <VscError size={24} />
        <p>{error || 'Failed to load tags'}</p>
        <button onClick={handleRefresh}>Retry</button>
      </LoadingOrError>
    );
  }
  
  return (
    <TagsListContainer>
      <TagsListHeader>
        <TagsListTitle>Tags ({tags.length})</TagsListTitle>
        <TagsListActions>
          <button onClick={handleRefresh} title="Refresh">
            <VscRefresh />
          </button>
          <button onClick={handleCreateTag} title="New Tag">
            <VscAdd />
          </button>
        </TagsListActions>
      </TagsListHeader>
      
      <TagsGrid>
        {tags.length === 0 ? (
          <p>No tags found. Create your first tag!</p>
        ) : (
          tags.map(tag => (
            <TagItem key={tag.id}>
              <TagName 
                color={tag.color} 
                onClick={() => handleTagClick(tag)}
              >
                {tag.name}
              </TagName>
              
              <TagActions>
                <TagCount>{getTagCount(tag.name)} notes</TagCount>
                <button 
                  className="icon"
                  onClick={(e) => handleDeleteClick(tag, e)}
                  title="Delete Tag"
                >
                  <VscTrash />
                </button>
              </TagActions>
            </TagItem>
          ))
        )}
      </TagsGrid>
      
      {tagToDelete && (
        <>
          <Backdrop onClick={handleDeleteCancel} />
          <ConfirmDialog>
            <h3>Delete Tag</h3>
            <p>Are you sure you want to delete the tag "{tagToDelete.name}"? This will remove the tag from all notes.</p>
            <div className="actions">
              <button className="secondary" onClick={handleDeleteCancel}>Cancel</button>
              <button onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </ConfirmDialog>
        </>
      )}
    </TagsListContainer>
  );
};

export default TagsList;