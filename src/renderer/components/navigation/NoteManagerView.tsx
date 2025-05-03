import React from 'react';
import Icon from '@mdi/react';
import { mdiNotebook } from '@mdi/js';

const NoteManagerView: React.FC = () => {
  return (
    <div className="navigator-view note-manager-view">
      <div className="navigator-header">Note Manager</div>
      <div className="navigator-content">
        <div className="placeholder">
          <Icon path={mdiNotebook} size={2} />
          <h3>Note Manager</h3>
          <p>Note management will be implemented in Phase 5</p>
        </div>
      </div>
    </div>
  );
};

export default NoteManagerView;
