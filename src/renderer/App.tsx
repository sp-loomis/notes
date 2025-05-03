import React, { useState } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import './styles/global.css';

// Import components
import TabBar from './components/layout/TabBar';
import SearchView from './components/navigation/SearchView';
import NoteManagerView from './components/navigation/NoteManagerView';
import TagOrganizerView from './components/navigation/TagOrganizerView';

const App: React.FC = () => {
  // State to track the active navigator tab
  const [activeTab, setActiveTab] = useState<string>('search');

  // Render the appropriate navigator view based on the active tab
  const renderNavigatorView = () => {
    switch (activeTab) {
      case 'search':
        return <SearchView />;
      case 'notes':
        return <NoteManagerView />;
      case 'tags':
        return <TagOrganizerView />;
      default:
        return <SearchView />;
    }
  };

  return (
    <div className="app-container">
      {/* Tab Bar (Left sidebar) */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main area with resizable panels */}
      <Allotment>
        {/* Navigator Panel */}
        <Allotment.Pane preferredSize={300} minSize={200} maxSize={500}>
          <div className="navigator-panel">{renderNavigatorView()}</div>
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
  );
};

export default App;
