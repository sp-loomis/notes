import React from 'react';

interface MarkupViewerProps {
  content: string;
  isEditing: boolean;
  onChange: (content: string) => void;
  editorContent: string;
}

const MarkupViewer: React.FC<MarkupViewerProps> = ({
  content,
  isEditing,
  onChange,
  editorContent,
}) => {
  // This is a placeholder implementation that will be enhanced in future sprints
  // with a proper editor like Lexical

  return (
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
};

export default MarkupViewer;
