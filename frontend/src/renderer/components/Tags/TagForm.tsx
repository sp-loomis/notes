import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { createTag, updateTag } from '../../store/tagsSlice';
import { VscSave, VscClose } from 'react-icons/vsc';

interface TagFormProps {
  tag?: Tag; // If provided, we're editing an existing tag
  onCancel: () => void;
}

const TagFormContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--background-color);
  border-radius: 4px;
  padding: 20px;
  width: 350px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  
  h2 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 16px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  
  label {
    display: block;
    margin-bottom: 5px;
    font-size: 14px;
  }
  
  input, textarea {
    width: 100%;
    padding: 8px;
    border-radius: 3px;
    font-size: 14px;
    background-color: var(--input-background);
    color: var(--input-text);
    border: 1px solid var(--border-color);
  }
  
  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const ColorPreview = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 1px solid var(--border-color);
`;

const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 12px;
  margin-top: 5px;
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
`;

const TagForm: React.FC<TagFormProps> = ({ tag, onCancel }) => {
  const dispatch = useDispatch();
  
  const [name, setName] = useState(tag?.name || '');
  const [color, setColor] = useState(tag?.color || '#0e639c');
  const [description, setDescription] = useState(tag?.description || '');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Tag name is required');
      return;
    }
    
    if (tag) {
      // Update existing tag
      dispatch(updateTag({
        id: tag.id,
        tagData: { name, color, description }
      }));
    } else {
      // Create new tag
      dispatch(createTag({ name, color, description }));
    }
    
    onCancel();
  };
  
  return (
    <>
      <Backdrop onClick={onCancel} />
      <TagFormContainer>
        <h2>{tag ? 'Edit Tag' : 'New Tag'}</h2>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tag name"
              required
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="color">Color</label>
            <ColorRow>
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <ColorPreview color={color} />
              <span>{color}</span>
            </ColorRow>
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this tag"
            />
          </FormGroup>
          
          <FormActions>
            <button type="button" className="secondary" onClick={onCancel}>
              <VscClose /> Cancel
            </button>
            <button type="submit">
              <VscSave /> {tag ? 'Update' : 'Create'} Tag
            </button>
          </FormActions>
        </form>
      </TagFormContainer>
    </>
  );
};

export default TagForm;