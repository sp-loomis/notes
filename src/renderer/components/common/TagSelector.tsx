import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiTagPlus, mdiTagRemove, mdiPlus, mdiClose } from '@mdi/js';
import { Tag } from '../../../database/models/tag';

interface TagSelectorProps {
  selectedTags: Tag[];
  onAddTag: (tag: Tag) => void;
  onRemoveTag: (tagId: number) => void;
  isEditing: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onAddTag,
  onRemoveTag,
  isEditing,
}) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all available tags from the database
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual tag repository call
        // This is currently using mock data until we integrate the tagRepository
        const mockTags: Tag[] = [
          {
            id: 1,
            name: 'Personal',
            color: '#4299e1',
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            name: 'Work',
            color: '#48bb78',
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 3,
            name: 'Ideas',
            color: '#ed8936',
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 4,
            name: 'Important',
            color: '#e53e3e',
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 5,
            name: 'Research',
            color: '#805ad5',
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        setAllTags(mockTags);
      } catch (err) {
        setError(`Error loading tags: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const getAvailableTags = () => {
    // Filter out tags that are already selected
    return allTags.filter((tag) => !selectedTags.some((selected) => selected.id === tag.id));
  };

  return (
    <div className="tag-selector">
      <div className="selected-tags">
        {selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <div key={tag.id} className="tag-item" style={{ backgroundColor: tag.color }}>
              <span>{tag.name}</span>
              {isEditing && (
                <button
                  className="tag-remove-button"
                  onClick={() => onRemoveTag(tag.id)}
                  title={`Remove ${tag.name} tag`}
                >
                  <Icon path={mdiClose} size={0.6} />
                </button>
              )}
            </div>
          ))
        ) : (
          <span className="no-tags-message">No tags</span>
        )}
      </div>

      {isEditing && (
        <div className="tag-selector-actions">
          <button
            className="add-tag-button"
            onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
            title="Add tags"
          >
            <Icon path={mdiTagPlus} size={0.9} />
            <span>Add Tags</span>
          </button>

          {isTagMenuOpen && (
            <div className="tag-menu">
              {loading ? (
                <div className="tag-menu-loading">Loading tags...</div>
              ) : error ? (
                <div className="tag-menu-error">{error}</div>
              ) : getAvailableTags().length > 0 ? (
                <div className="available-tags">
                  {getAvailableTags().map((tag) => (
                    <div
                      key={tag.id}
                      className="available-tag-item"
                      onClick={() => {
                        onAddTag(tag);
                        setIsTagMenuOpen(false);
                      }}
                    >
                      <div className="tag-color" style={{ backgroundColor: tag.color }}></div>
                      <span>{tag.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-available-tags">
                  <p>No more tags available</p>
                  <p className="create-tag-hint">Create tags in the Tag Organizer</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
