import React, { useState } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import './styles/global.css';

// Import components
import TabBar from './components/layout/TabBar';
import SearchView from './components/navigation/SearchView';
import NoteManagerView from './components/navigation/NoteManagerView';
import TagOrganizerView from './components/navigation/TagOrganizerView';

// Import context providers
import { NotesProvider } from './contexts/NotesContext';
import { ComponentsProvider } from './contexts/ComponentsContext';

const App: React.FC = () => {
  // State to track the active navigator tab
  const [activeTab, setActiveTab] = useState<string>('search');

  // Render the appropriate navigator view based on the active tab
  const renderNavigatorContent = () => {
    switch (activeTab) {
      case 'search':
        return <SearchView onSwitchToNoteManager={() => setActiveTab('notes')} />;
      case 'notes':
        return <NoteManagerView />;
      case 'tags':
        return <TagOrganizerView />;
      default:
        return <SearchView onSwitchToNoteManager={() => setActiveTab('notes')} />;
    }
  };

  return (
    <NotesProvider>
      <ComponentsProvider>
        <div className="app-container">
          {/* Tab Bar (Left sidebar) */}
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Main area with resizable panels */}
          <Allotment>
            {/* Navigator Panel - direct rendering without div */}
            <Allotment.Pane
              preferredSize={300}
              minSize={200}
              maxSize={500}
              snap={true}
              className="navigator-panel"
            >
              {renderNavigatorContent()}
            </Allotment.Pane>

            {/* Main Content Area */}
            <Allotment.Pane>
              <div className="main-content">
                <div className="placeholder">
                  <h3>Notes Application</h3>
                  <p>Select a note to view its contents</p>
                  <p>
                    <small>Main content area will be implemented in Phase 5</small>
                  </p>
                </div>
              </div>
            </Allotment.Pane>
          </Allotment>
        </div>
      </ComponentsProvider>
    </NotesProvider>
  );
};

export default App;
