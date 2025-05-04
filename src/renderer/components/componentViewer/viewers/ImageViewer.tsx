import React from 'react';

interface ImageViewerProps {
  content: string;
  isEditing: boolean;
  onChange: (content: string) => void;
  editorContent: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  content,
  isEditing,
  onChange,
  editorContent,
}) => {
  // Handle file selection for image uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file as Base64
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="image-viewer">
      {isEditing ? (
        <div className="image-editor">
          <div className="image-preview">
            {editorContent && <img src={editorContent} alt="Preview" />}
          </div>
          <div className="image-upload">
            <input type="file" accept="image/*" onChange={handleFileChange} />
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
};

export default ImageViewer;
