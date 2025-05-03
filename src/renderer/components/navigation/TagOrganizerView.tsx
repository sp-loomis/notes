import React from 'react';
import Icon from '@mdi/react';
import { mdiTagMultiple } from '@mdi/js';

const TagOrganizerView: React.FC = () => {
  return (
    <div className="navigator-view tag-organizer-view">
      <div className="navigator-header">Tag Organizer</div>
      <div className="navigator-content">
        <div className="placeholder">
          <Icon path={mdiTagMultiple} size={2} />
          <h3>Tag Organizer</h3>
          <p>Tag organization will be implemented in Phase 8</p>
        </div>
      </div>
    </div>
  );
};

export default TagOrganizerView;
