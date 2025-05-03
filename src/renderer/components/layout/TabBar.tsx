import React from 'react';
import Icon from '@mdi/react';
import { mdiMagnify, mdiNotebook, mdiTagMultiple } from '@mdi/js';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

/**
 * Vertical tab bar for switching between different navigator views
 */
const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'search', icon: mdiMagnify, label: 'Search Notes' },
    { id: 'notes', icon: mdiNotebook, label: 'Note Manager' },
    { id: 'tags', icon: mdiTagMultiple, label: 'Tag Organizer' },
  ];

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-bar-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          title={tab.label}
          aria-label={tab.label}
        >
          <Icon path={tab.icon} size={1.2} />
        </button>
      ))}
    </div>
  );
};

export default TabBar;
