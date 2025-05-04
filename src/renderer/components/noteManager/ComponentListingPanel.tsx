import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiCodeBraces,
  mdiImageOutline,
  mdiMapOutline,
  mdiPencilRuler,
  mdiPlus,
  mdiPencil,
  mdiCheck,
  mdiClose,
  mdiDelete,
  mdiAlertCircle,
  mdiCalendar,
} from '@mdi/js';
import { useComponents } from '../../contexts/ComponentsContext';
import { Component, ComponentType, CreateComponentData } from '../../../database/models/component';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

interface ComponentListingPanelProps {
  noteId: number;
}

const ComponentListingPanel: React.FC<ComponentListingPanelProps> = ({ noteId }) => {
  const {
    components,
    loading,
    error,
    selectedComponent,
    createComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
  } = useComponents();

  const [isCreating, setIsCreating] = useState(false);
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentType, setNewComponentType] = useState<ComponentType>(ComponentType.Markup);

  const [isEditing, setIsEditing] = useState(false);
  const [editingComponentId, setEditingComponentId] = useState<number | null>(null);
  const [editingComponentName, setEditingComponentName] = useState('');

  const [componentToDelete, setComponentToDelete] = useState<Component | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);

  // Get icon for component type
  const getComponentTypeIcon = (type: ComponentType) => {
    switch (type) {
      case ComponentType.Markup:
        return mdiCodeBraces;
      case ComponentType.Image:
        return mdiImageOutline;
      case ComponentType.GeoJSON:
        return mdiMapOutline;
      case ComponentType.TLDraw:
        return mdiPencilRuler;
      default:
        return mdiCodeBraces;
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle component creation form submission
  const handleCreateComponent = async () => {
    if (!newComponentName.trim()) return;

    try {
      setComponentError(null);
      const data: CreateComponentData = {
        noteId,
        name: newComponentName.trim(),
        type: newComponentType,
      };

      // Create component with initial content
      let initialContent = '';

      // Set initial content based on component type
      switch (newComponentType) {
        case ComponentType.Markup:
          initialContent = '<p>Start writing here...</p>';
          break;
        case ComponentType.Image:
          initialContent = ''; // Empty for image until upload
          break;
        case ComponentType.GeoJSON:
          initialContent = JSON.stringify({ type: 'FeatureCollection', features: [] });
          break;
        case ComponentType.TLDraw:
          initialContent = JSON.stringify({ shapes: [] });
          break;
      }

      const componentId = await createComponent(data, initialContent);

      if (componentId > 0) {
        // Reset form
        setNewComponentName('');
        setNewComponentType(ComponentType.Markup);
        setIsCreating(false);

        // Select the new component
        await selectComponent(componentId);
      } else {
        setComponentError('Failed to create component.');
      }
    } catch (err) {
      setComponentError(
        `Error creating component: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  // Start editing component name
  const handleStartEditing = (component: Component) => {
    setEditingComponentId(component.id);
    setEditingComponentName(component.name);
    setIsEditing(true);
    setComponentError(null);
  };

  // Cancel editing component name
  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditingComponentId(null);
    setComponentError(null);
  };

  // Save component name changes
  const handleSaveEditing = async () => {
    if (!editingComponentId || !editingComponentName.trim()) return;

    try {
      setComponentError(null);
      const success = await updateComponent(editingComponentId, {
        name: editingComponentName.trim(),
      });

      if (success) {
        setIsEditing(false);
        setEditingComponentId(null);
      } else {
        setComponentError('Failed to update component name.');
      }
    } catch (err) {
      setComponentError(
        `Error updating component: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  // Handle component deletion
  const handleDeleteComponent = async () => {
    if (!componentToDelete) return;

    try {
      setComponentError(null);
      const success = await deleteComponent(componentToDelete.id);

      if (success) {
        setComponentToDelete(null);
      } else {
        setComponentError('Failed to delete component.');
      }
    } catch (err) {
      setComponentError(
        `Error deleting component: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  // Handle component selection
  const handleSelectComponent = async (component: Component) => {
    try {
      setComponentError(null);
      await selectComponent(component.id);
    } catch (err) {
      setComponentError(
        `Error selecting component: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  return (
    <div className="component-listing-panel">
      <div className="panel-header">
        <h3>Components</h3>
        <button
          className="icon-button primary"
          onClick={() => setIsCreating(true)}
          title="Add component"
        >
          <Icon path={mdiPlus} size={0.9} />
        </button>
      </div>

      {(error || componentError) && (
        <div className="error-message">
          <Icon path={mdiAlertCircle} size={0.8} />
          <span>{error || componentError}</span>
        </div>
      )}

      {/* Component creation form */}
      {isCreating && (
        <div className="component-creation-form">
          <h4>New Component</h4>
          <div className="form-group">
            <label htmlFor="component-name">Name:</label>
            <input
              id="component-name"
              type="text"
              value={newComponentName}
              onChange={(e) => setNewComponentName(e.target.value)}
              placeholder="Enter component name"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="component-type">Type:</label>
            <select
              id="component-type"
              value={newComponentType}
              onChange={(e) => setNewComponentType(e.target.value as ComponentType)}
            >
              <option value={ComponentType.Markup}>Markup</option>
              <option value={ComponentType.Image}>Image</option>
              <option value={ComponentType.GeoJSON}>GeoJSON</option>
              <option value={ComponentType.TLDraw}>TLDraw</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setIsCreating(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleCreateComponent}
              disabled={!newComponentName.trim() || loading}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Component listing */}
      <div className="component-list">
        {loading ? (
          <div className="loading">Loading components...</div>
        ) : components.length === 0 ? (
          <div className="empty-message">
            <p>No components yet</p>
            <button className="primary-button" onClick={() => setIsCreating(true)}>
              Create Component
            </button>
          </div>
        ) : (
          <ul>
            {components.map((component) => (
              <li
                key={component.id}
                className={`component-item ${selectedComponent?.id === component.id ? 'selected' : ''}`}
                onClick={() => handleSelectComponent(component)}
              >
                <div className="component-icon" data-testid="component-icon">
                  <Icon path={getComponentTypeIcon(component.type)} size={0.9} />
                </div>

                <div className="component-info">
                  {isEditing && editingComponentId === component.id ? (
                    <div className="component-edit">
                      <input
                        type="text"
                        value={editingComponentName}
                        onChange={(e) => setEditingComponentName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button
                          className="icon-button small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEditing();
                          }}
                          disabled={!editingComponentName.trim() || loading}
                          title="Save"
                        >
                          <Icon path={mdiCheck} size={0.7} />
                        </button>
                        <button
                          className="icon-button small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEditing();
                          }}
                          title="Cancel"
                        >
                          <Icon path={mdiClose} size={0.7} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="component-name">{component.name}</span>
                      <div className="component-actions">
                        <button
                          className="icon-button small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditing(component);
                          }}
                          title="Rename"
                        >
                          <Icon path={mdiPencil} size={0.7} />
                        </button>
                        <button
                          className="icon-button small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setComponentToDelete(component);
                          }}
                          title="Delete"
                        >
                          <Icon path={mdiDelete} size={0.7} />
                        </button>
                      </div>
                    </>
                  )}
                  <div className="component-metadata">
                    <Icon path={mdiCalendar} size={0.6} />
                    <span>{formatDate(component.updatedAt)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete confirmation modal */}
      {componentToDelete && (
        <DeleteConfirmationModal
          title="Delete Component"
          message={`Are you sure you want to delete the component "${componentToDelete.name}"? This action cannot be undone and will delete all versions of this component.`}
          onConfirm={handleDeleteComponent}
          onCancel={() => setComponentToDelete(null)}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default ComponentListingPanel;
