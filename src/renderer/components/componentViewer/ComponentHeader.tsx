import React from 'react';
import Icon from '@mdi/react';
import { mdiPencil, mdiCheck, mdiClose, mdiCalendarClock } from '@mdi/js';
import { ComponentVersion } from '../../../database/models/component-version';

interface ComponentHeaderProps {
  name: string;
  isEditing: boolean;
  onEditToggle: () => void;
  onClose: () => void;
  versions: ComponentVersion[];
  selectedVersionId: string | null;
  onVersionSelect: (versionId: string) => void;
}

const ComponentHeader: React.FC<ComponentHeaderProps> = ({
  name,
  isEditing,
  onEditToggle,
  onClose,
  versions,
  selectedVersionId,
  onVersionSelect,
}) => {
  // Format version date for display in dropdown
  const formatVersionDate = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Sort versions by date (newest first)
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="component-header">
      <div className="component-title">
        <h3>{name}</h3>
      </div>

      <div className="component-actions">
        {/* Version selector */}
        {versions.length > 0 && (
          <div className="version-selector">
            <Icon path={mdiCalendarClock} size={0.8} />
            <select
              value={selectedVersionId || ''}
              onChange={(e) => onVersionSelect(e.target.value)}
              disabled={isEditing}
            >
              {sortedVersions.map((version) => (
                <option key={version.id} value={version.id}>
                  {formatVersionDate(version.createdAt)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Edit/Save button */}
        <button
          className={`icon-button ${isEditing ? 'success' : 'primary'}`}
          onClick={onEditToggle}
          title={isEditing ? 'Save changes' : 'Edit component'}
        >
          <Icon path={isEditing ? mdiCheck : mdiPencil} size={0.9} />
        </button>

        {/* Close button */}
        <button className="icon-button secondary" onClick={onClose} title="Close component">
          <Icon path={mdiClose} size={0.9} />
        </button>
      </div>
    </div>
  );
};

export default ComponentHeader;
