import React from 'react';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';

const SearchView: React.FC = () => {
  return (
    <div className="navigator-view search-view">
      <div className="navigator-header">Search Notes</div>
      <div className="navigator-content">
        <div className="placeholder">
          <Icon path={mdiMagnify} size={2} />
          <h3>Search Notes</h3>
          <p>Search functionality will be implemented in Phase 6</p>
        </div>
      </div>
    </div>
  );
};

export default SearchView;
