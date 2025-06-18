import React, { useState } from 'react';
import { createBoard } from '../Api/api';
import '../Style/addBoardStyle.css';

type AddBoardModalProps = {
  workspaceId: string;
  onClose: () => void;
  onBoardCreated?: () => void;
};

const AddBoardModal: React.FC<AddBoardModalProps> = ({ workspaceId, onClose, onBoardCreated }) => {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createBoard(workspaceId, name, imageFile ?? undefined);
      onBoardCreated?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка создания доски');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Создать доску</h2>
          <button className="modal-close" onClick={onClose} type="button">
            &times;
          </button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Название доски</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Введите название доски"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Картинка (необязательно)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImageFile(file);
              }}
              className="form-file-input"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-buttons">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-submit"
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBoardModal;