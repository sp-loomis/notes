import React from 'react';

interface TLDrawViewerProps {
  content: string;
  isEditing: boolean;
  onChange: (content: string) => void;
  editorContent: string;
}

const TLDrawViewer: React.FC<TLDrawViewerProps> = ({
  content,
  isEditing,
  onChange,
  editorContent,
}) => {
  // This is a placeholder implementation that will be enhanced in a future sprint
  // with the actual TLDraw integration

  return (
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
};

export default TLDrawViewer;
