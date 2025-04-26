import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { fetchNotes, updateNote } from '../../store/notesSlice';
import { VscSave, VscClose } from 'react-icons/vsc';

interface LinkFormProps {
  noteId: string;
  onCancel: () => void;
}

const LinkFormContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--background-color);
  border-radius: 4px;
  padding: 20px;
  width: 400px;
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
  
  select {
    width: 100%;
    padding: 8px;
    border-radius: 3px;
    font-size: 14px;
    background-color: var(--input-background);
    color: var(--input-text);
    border: 1px solid var(--border-color);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
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

const LinkForm: React.FC<LinkFormProps> = ({ noteId, onCancel }) => {
  const dispatch = useDispatch();
  const { notes, status } = useSelector((state: RootState) => state.notes);
  
  const [targetNoteId, setTargetNoteId] = useState('');
  const [linkType, setLinkType] = useState('related');
  const [error, setError] = useState('');
  
  // Get the source note
  const sourceNote = notes.find(note => note.id === noteId);
  
  // Filter out the source note and any notes already linked to it
  const availableNotes = notes.filter(note => {
    // Skip the current note
    if (note.id === noteId) return false;
    
    // Skip notes that are already linked
    if (sourceNote?.links.some(link => link.targetId === note.id)) return false;
    
    return true;
  });
  
  useEffect(() => {
    // Make sure we have the latest notes
    dispatch(fetchNotes());
  }, [dispatch]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetNoteId) {
      setError('Please select a note to link to');
      return;
    }
    
    if (!sourceNote) {
      setError('Source note not found');
      return;
    }
    
    // Create the new link
    const newLink = {
      targetId: targetNoteId,
      type: linkType
    };
    
    // Add the link to the source note
    const updatedLinks = [...sourceNote.links, newLink];
    
    // Update the note
    dispatch(updateNote({
      id: sourceNote.id,
      noteData: { links: updatedLinks }
    }));
    
    onCancel();
  };
  
  return (
    <>
      <Backdrop onClick={onCancel} />
      <LinkFormContainer>
        <h2>Create Link from "{sourceNote?.title}"</h2>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="targetNote">Target Note</label>
            <select
              id="targetNote"
              value={targetNoteId}
              onChange={(e) => setTargetNoteId(e.target.value)}
            >
              <option value="">-- Select a note --</option>
              {availableNotes.map(note => (
                <option key={note.id} value={note.id}>
                  {note.title}
                </option>
              ))}
            </select>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="linkType">Link Type</label>
            <select
              id="linkType"
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
            >
              <option value="related">Related</option>
              <option value="reference">Reference</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="next">Next</option>
              <option value="previous">Previous</option>
            </select>
          </FormGroup>
          
          <FormActions>
            <button type="button" className="secondary" onClick={onCancel}>
              <VscClose /> Cancel
            </button>
            <button type="submit" disabled={status === 'loading'}>
              <VscSave /> Create Link
            </button>
          </FormActions>
        </form>
      </LinkFormContainer>
    </>
  );
};

export default LinkForm;