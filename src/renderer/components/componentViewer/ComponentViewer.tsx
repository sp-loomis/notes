import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircle, mdiRefresh } from '@mdi/js';
import { useComponents, ComponentErrorType } from '../../contexts/ComponentsContext';
import ComponentHeader from './ComponentHeader';
import { ComponentType } from '../../../database/models/component';
import '../../styles/component-viewer.css';

// Import stub for the viewers while they're being implemented
// These will be replaced with actual implementations
const MarkupViewer: React.FC<any> = ({ content, isEditing, onChange, editorContent }) => (
  <div className="markup-viewer">
    {isEditing ? (
      <textarea
        className="markup-editor"
        value={editorContent}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter markup content here..."
      />
    ) : (
      <div className="markup-content" dangerouslySetInnerHTML={{ __html: content }} />
    )}
  </div>
);

const ImageViewer: React.FC<any> = ({ content, isEditing, onChange, editorContent }) => (
  <div className="image-viewer">
    {isEditing ? (
      <div className="image-editor">
        <div className="image-preview">
          {editorContent && <img src={editorContent} alt="Preview" />}
        </div>
        <div className="image-upload">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  onChange(reader.result);
                }
              };
              reader.readAsDataURL(file);
            }}
          />
          <p className="helper-text">Select an image file to upload</p>
        </div>
      </div>
    ) : (
      <div className="image-display">
        {content ? (
          <img src={content} alt="Component content" />
        ) : (
          <div className="no-image">No image content available</div>
        )}
      </div>
    )}
  </div>
);

const GeoJSONViewer: React.FC<any> = ({ content, isEditing, onChange, editorContent }) => (
  <div className="geojson-viewer">
    {isEditing ? (
      <textarea
        className="geojson-editor"
        value={editorContent}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter GeoJSON content here..."
      />
    ) : (
      <div className="geojson-placeholder">
        <h3>GeoJSON Viewer</h3>
        <p>
          This is a placeholder for the GeoJSON viewer that will be implemented in a future sprint.
        </p>
        <pre className="geojson-content">{content}</pre>
      </div>
    )}
  </div>
);

const TLDrawViewer: React.FC<any> = ({ content, isEditing, onChange, editorContent }) => (
  <div className="tldraw-viewer">
    {isEditing ? (
      <div className="tldraw-editor-placeholder">
        <h3>TLDraw Editor</h3>
        <p>This is a placeholder for the TLDraw editor that will be implemented in Sprint 10.</p>
        <textarea
          className="tldraw-content-editor"
          value={editorContent}
          onChange={(e) => onChange(e.target.value)}
          placeholder="TLDraw content will be stored here..."
        />
      </div>
    ) : (
      <div className="tldraw-display-placeholder">
        <h3>TLDraw Viewer</h3>
        <p>This is a placeholder for the TLDraw viewer that will be implemented in Sprint 10.</p>
        <pre className="tldraw-content">{content}</pre>
      </div>
    )}
  </div>
);

const ComponentViewer: React.FC = () => {
  const {
    selectedComponent,
    selectedVersion,
    loading,
    error,
    errorType,
    loadComponentVersion,
    updateComponentContent,
    selectComponent,
    clearError,
  } = useComponents();

  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState<string>('');
  const [versions, setVersions] = useState<any[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reset state when component changes
  useEffect(() => {
    setIsEditing(false);
    setEditorContent(selectedVersion?.content || '');
    setSaveError(null);

    // If we have a component repository, we should fetch versions
    // For now we'll simulate this with the selected version
    if (selectedVersion) {
      setVersions([selectedVersion]);
    } else {
      setVersions([]);
    }
  }, [selectedComponent, selectedVersion]);

  // Handle error retry actions based on error type
  const handleErrorRetry = async () => {
    clearError();
    
    if (!selectedComponent) return;
    
    switch (errorType) {
      case ComponentErrorType.VERSION:
        if (selectedComponent) {
          await loadComponentVersion(selectedVersion?.id || '');
        }
        break;
      case ComponentErrorType.SELECT:
        if (selectedComponent) {
          await selectComponent(selectedComponent.id);
        }
        break;
      default:
        // For other error types, just clear the error
        break;
    }
  };

  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="component-viewer-loading">
        <div className="loading-spinner"></div>
        <p>Loading component...</p>
      </div>
    );
  }

  // If there's an error, show an error message with retry option
  if (error) {
    return (
      <div className="component-viewer-error">
        <Icon path={mdiAlertCircle} size={1.5} />
        <h3>Error</h3>
        <p>{error}</p>
        <button className="retry-button" onClick={handleErrorRetry}>
          <Icon path={mdiRefresh} size={0.8} />
          Retry
        </button>
      </div>
    );
  }

  // If no component is selected, show a placeholder
  if (!selectedComponent || !selectedVersion) {
    return (
      <div className="component-viewer-placeholder">
        <h3>No Component Selected</h3>
        <p>Select a component from the note components panel to view its content.</p>
      </div>
    );
  }

  // Toggle between edit and view modes
  const handleEditToggle = async () => {
    if (isEditing) {
      // Save changes when switching from edit to view mode
      try {
        setSaveError(null);
        await updateComponentContent(selectedComponent.id, editorContent);
        setIsEditing(false);
      } catch (err) {
        setSaveError(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };

  // Close component viewer (reset selection)
  const handleClose = () => {
    setIsEditing(false);
    setSaveError(null);
    // Reset the component selection to properly close the viewer
    setTimeout(() => {
      selectComponent(0); // 0 or invalid ID to clear selection
    }, 0);
  };

  // Handle version selection
  const handleVersionSelect = async (versionId: string) => {
    await loadComponentVersion(versionId);
  };

  // Render appropriate viewer based on component type
  const renderViewer = () => {
    switch (selectedComponent.type) {
      case ComponentType.Markup:
        return (
          <MarkupViewer
            content={selectedVersion.content}
            isEditing={isEditing}
            onChange={setEditorContent}
            editorContent={editorContent}
          />
        );
      case ComponentType.Image:
        return (
          <ImageViewer
            content={selectedVersion.content}
            isEditing={isEditing}
            onChange={setEditorContent}
            editorContent={editorContent}
          />
        );
      case ComponentType.GeoJSON:
        return (
          <GeoJSONViewer
            content={selectedVersion.content}
            isEditing={isEditing}
            onChange={setEditorContent}
            editorContent={editorContent}
          />
        );
      case ComponentType.TLDraw:
        return (
          <TLDrawViewer
            content={selectedVersion.content}
            isEditing={isEditing}
            onChange={setEditorContent}
            editorContent={editorContent}
          />
        );
      default:
        return <div>Unsupported component type</div>;
    }
  };

  return (
    <div className="component-viewer">
      <ComponentHeader
        name={selectedComponent.name}
        isEditing={isEditing}
        onEditToggle={handleEditToggle}
        onClose={handleClose}
        versions={versions}
        selectedVersionId={selectedVersion ? selectedVersion.id : null}
        onVersionSelect={handleVersionSelect}
      />
      
      {saveError && (
        <div className="save-error-message">
          <Icon path={mdiAlertCircle} size={0.8} />
          <span>{saveError}</span>
          <button className="clear-error" onClick={() => setSaveError(null)}>
            Dismiss
          </button>
        </div>
      )}
      
      <div className="component-content">{renderViewer()}</div>
    </div>
  );
};

export default ComponentViewer;
