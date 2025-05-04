import React from 'react';

interface GeoJSONViewerProps {
  content: string;
  isEditing: boolean;
  onChange: (content: string) => void;
  editorContent: string;
}

const GeoJSONViewer: React.FC<GeoJSONViewerProps> = ({
  content,
  isEditing,
  onChange,
  editorContent,
}) => {
  // This is a placeholder implementation that will be enhanced in a future sprint
  // with a proper GeoJSON viewer/editor using Leaflet

  return (
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
            This is a placeholder for the GeoJSON viewer that will be implemented in a future
            sprint.
          </p>
          <pre className="geojson-content">{content}</pre>
        </div>
      )}
    </div>
  );
};

export default GeoJSONViewer;
