import React from 'react';
import Icon from '@mdi/react';
import { mdiAlert, mdiClose } from '@mdi/js';

interface DeleteConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onCancel}>
            <Icon path={mdiClose} size={0.9} />
          </button>
        </div>
        <div className="modal-content">
          <div className="modal-icon">
            <Icon path={mdiAlert} size={2} color="#e53e3e" />
          </div>
          <p>{message}</p>
        </div>
        <div className="modal-actions">
          <button className="cancel-button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button className="delete-button" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
