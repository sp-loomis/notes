import React, { useState, useEffect } from 'react';
import { useComponents } from '../../contexts/ComponentsContext';
import ComponentHeader from './ComponentHeader';
import { ComponentType } from '../../../database/models/component';

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
    loadComponentVersion,
    updateComponentContent,
    selectComponent,
  } = useComponents();

  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState<string>('');
  const [versions, setVersions] = useState<any[]>([]);

  // Reset state when component changes
  useEffect(() => {
    setIsEditing(false);
    setEditorContent(selectedVersion?.content || '');

    // If we have a component repository, we should fetch versions
    // For now we'll simulate this with the selected version
    if (selectedVersion) {
      setVersions([selectedVersion]);
    } else {
      setVersions([]);
    }
  }, [selectedComponent, selectedVersion]);

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
      await updateComponentContent(selectedComponent.id, editorContent);
      setIsEditing(false);
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };

  // Close component viewer (reset selection)
  const handleClose = () => {
    setIsEditing(false);
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
      <div className="component-content">{renderViewer()}</div>
    </div>
  );
};

export default ComponentViewer;
