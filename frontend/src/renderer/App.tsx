import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { fetchNotes } from './store/notesSlice';
import { fetchTags } from './store/tagsSlice';
import GlobalStyles from './styles/globalStyles';
import Layout from './components/Layout';
import { NoteViewer, NoteForm, LinkForm } from './components/Notes';
import { TagForm } from './components/Tags';

type EditorMode = 'view' | 'edit' | 'create' | 'createTag' | 'editTag' | 'createLink';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { currentNote } = useSelector((state: RootState) => state.notes);
  const { currentTag } = useSelector((state: RootState) => state.tags);
  const { theme } = useSelector((state: RootState) => state.ui);
  const [editorMode, setEditorMode] = useState<EditorMode>('view');
  
  useEffect(() => {
    // Set theme on body element
    document.body.setAttribute('data-theme', theme);
    
    // Load initial data
    dispatch(fetchNotes());
    dispatch(fetchTags());
  }, [dispatch, theme]);
  
  const renderContent = () => {
    switch (editorMode) {
      case 'edit':
        return currentNote ? (
          <NoteForm 
            noteId={currentNote.id} 
            onCancel={() => setEditorMode('view')} 
          />
        ) : (
          <NoteViewer />
        );
        
      case 'create':
        return (
          <NoteForm 
            onCancel={() => setEditorMode('view')} 
          />
        );
        
      case 'createTag':
        return (
          <TagForm 
            onCancel={() => setEditorMode('view')} 
          />
        );
        
      case 'editTag':
        return currentTag ? (
          <TagForm 
            tag={currentTag} 
            onCancel={() => setEditorMode('view')} 
          />
        ) : (
          <NoteViewer />
        );
        
      case 'createLink':
        return currentNote ? (
          <LinkForm 
            noteId={currentNote.id} 
            onCancel={() => setEditorMode('view')} 
          />
        ) : (
          <NoteViewer />
        );
        
      case 'view':
      default:
        return <NoteViewer />;
    }
  };
  
  return (
    <>
      <GlobalStyles />
      <Layout>
        {renderContent()}
      </Layout>
    </>
  );
};

export default App;