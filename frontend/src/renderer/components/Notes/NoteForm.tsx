import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { createNote, updateNote } from '../../store/notesSlice';
import { fetchTags } from '../../store/tagsSlice';
import { VscSave, VscClose, VscAdd, VscNewFile } from 'react-icons/vsc';
import NoteEditor from './NoteEditor';

interface NoteFormProps {
  noteId?: string; // If provided, we're editing an existing note
  onCancel: () => void;
}

const NoteFormContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid var(--border-color);
`;

const FormTitle = styled.h1`
  font-size: 20px;
  margin: 0;
`;

const FormActions = styled.div`
  display: flex;
  gap: 8px;
`;

const FormContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 15px;
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
  }
  
  textarea {
    min-height: 200px;
    resize: vertical;
  }
`;

const TagsContainer = styled.div`
  margin-bottom: 15px;
`;

const TagsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  
  h3 {
    font-size: 14px;
    font-weight: normal;
  }
`;

const TagsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
`;

const TagItem = styled.div<{ selected: boolean; color?: string }>`
  padding: 5px 10px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  background-color: ${props => props.selected ? props.color || 'var(--primary-color)' : 'var(--secondary-color)'};
  color: ${props => props.selected ? '#fff' : 'var(--text-color)'};
  
  &:hover {
    opacity: 0.9;
  }
`;

const TagForm = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 10px;
  
  input {
    flex: 1;
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 12px;
  margin-top: 5px;
`;

const EditorContainer = styled.div`
  margin-bottom: 15px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
`;

const NoteForm: React.FC<NoteFormProps> = ({ noteId, onCancel }) => {
  const dispatch = useDispatch();
  const { notes, status, error } = useSelector((state: RootState) => state.notes);
  const { tags } = useSelector((state: RootState) => state.tags);
  
  // Find the note if we're editing
  const noteToEdit = noteId ? notes.find(note => note.id === noteId) : null;
  
  // Form state
  const [title, setTitle] = useState(noteToEdit?.title || '');
  const [htmlContent, setHtmlContent] = useState(noteToEdit?.content.html || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(noteToEdit?.tags || []);
  const [newTagName, setNewTagName] = useState('');
  const [formError, setFormError] = useState('');
  
  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }
    
    // Extract plain text from the HTML for search functionality
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;
    const plainText = tempElement.textContent || '';
    
    if (noteToEdit) {
      // Update existing note
      dispatch(updateNote({
        id: noteToEdit.id,
        noteData: {
          title,
          content: { 
            html: htmlContent,
            plainText 
          },
          tags: selectedTags
        }
      }));
    } else {
      // Create new note
      dispatch(createNote({
        title,
        content: { 
          html: htmlContent,
          plainText 
        },
        tags: selectedTags,
        links: []
      }));
    }
    
    onCancel(); // Close the form after submission
  };
  
  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };
  
  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    
    // In a real app, we'd create a new tag if it doesn't exist
    // For now, we'll just add it to the selected tags
    if (!selectedTags.includes(newTagName)) {
      setSelectedTags([...selectedTags, newTagName]);
    }
    
    setNewTagName('');
  };
  
  const handleEditorChange = (html: string) => {
    setHtmlContent(html);
  };
  
  return (
    <NoteFormContainer>
      <FormHeader>
        <FormTitle>{noteToEdit ? 'Edit Note' : 'New Note'}</FormTitle>
        <FormActions>
          <button onClick={handleSubmit} title="Save Note">
            <VscSave />
          </button>
          <button onClick={onCancel} title="Cancel">
            <VscClose />
          </button>
        </FormActions>
      </FormHeader>
      
      <FormContent>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              required
            />
            {formError && <ErrorMessage>{formError}</ErrorMessage>}
          </FormGroup>
          
          <TagsContainer>
            <TagsHeader>
              <h3>Tags</h3>
            </TagsHeader>
            
            <TagsGrid>
              {tags.map(tag => (
                <TagItem
                  key={tag.id}
                  selected={selectedTags.includes(tag.name)}
                  color={tag.color}
                  onClick={() => toggleTag(tag.name)}
                >
                  {tag.name}
                </TagItem>
              ))}
            </TagsGrid>
            
            <TagForm>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name"
              />
              <button 
                type="button" 
                onClick={handleAddTag}
                title="Add Tag"
              >
                <VscAdd />
              </button>
            </TagForm>
          </TagsContainer>
          
          <FormGroup>
            <label htmlFor="content">Content</label>
            <EditorContainer>
              <NoteEditor 
                initialHtml={noteToEdit?.content.html || ''}
                onChange={handleEditorChange}
                placeholder="Enter note content..."
              />
            </EditorContainer>
          </FormGroup>
        </form>
      </FormContent>
    </NoteFormContainer>
  );
};

export default NoteForm;