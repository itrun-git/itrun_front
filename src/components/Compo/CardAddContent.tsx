import React, { useState, useEffect } from 'react';
import '../Style/CardAddContent.css';
import { Card, Comment, createCard, getCard, updateCard, deleteCard, getCardComments, addCardComment, deleteComment, uploadCardCover, deleteCardCover } from '../Api/api'; 

interface CardAddContentProps {
  workspaceId: string;
  boardId: string;
  columnId: string;
  cardId?: string;
  onClose: () => void;
  onCardCreated?: (card: Card) => void;
  onCardUpdated?: (card: Card) => void;
  onCardDeleted?: (cardId: string) => void;
}

export const CardAddContent: React.FC<CardAddContentProps> = ({
  workspaceId,
  boardId,
  columnId,
  cardId,
  onClose,
  onCardCreated,
  onCardUpdated,
  onCardDeleted
}) => {
  const [card, setCard] = useState<Card | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (cardId) {
      loadCard();
      loadComments();
    }
  }, [cardId]);

  const loadCard = async () => {
    if (!cardId) return;
    
    try {
      setIsLoading(true);
      const cardData = await getCard(workspaceId, boardId, columnId, cardId);
      setCard(cardData);
      setTitle(cardData.title);
      setDescription(cardData.description || '');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load card');
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    if (!cardId) return;
    try {
      const commentsData = await getCardComments(workspaceId, boardId, columnId, cardId);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const CreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setIsLoading(true);
      setError(null);
      const newCard = await createCard(workspaceId, boardId, columnId, {
        title: title.trim(),
        description: description.trim()
      });
      setCard(newCard);
      onCardCreated?.(newCard);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create card');
    } finally {
      setIsLoading(false);
    }
  };

  const UpdateCard = async () => {
    if (!cardId || !title.trim()) return;
    try {
      setIsLoading(true);
      setError(null);
      const updatedCard = await updateCard(workspaceId, boardId, columnId, cardId, {
        title: title.trim(),
        description: description.trim()
      });
      setCard(updatedCard);
      onCardUpdated?.(updatedCard);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update card');
    } finally {
      setIsLoading(false);
    }
  };

  const DeleteCard = async () => {
    if (!cardId) return;
    //if (!window.confirm('Are you sure you want to delete this card?')) return;
    try {
      setIsLoading(true);
      setError(null);
      await deleteCard(workspaceId, boardId, columnId, cardId);
      onCardDeleted?.(cardId);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete card');
    } finally {
      setIsLoading(false);
    }
  };

  const AddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId || !newComment.trim()) return;

    try {
      const comment = await addCardComment(workspaceId, boardId, columnId, cardId, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
      
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const DeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(workspaceId, commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const FileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cardId) return;

    try {
      setIsLoading(true);
      const cardData = await uploadCardCover(workspaceId, boardId, columnId, cardId, file);
      setCard(cardData);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  const DeleteCover = async () => {
    if (!cardId) return;

    try {
      await deleteCardCover(workspaceId, boardId, columnId, cardId);
      setCard(prev => prev ? { ...prev, coverImage: undefined } : null);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete cover');
    }
  };

  return (
    <div className="card-add-content">
      <div className="card-add-content-overlay" onClick={onClose}></div>
      
      <div className="card-add-content-modal">
        <div className="card-add-content-header">
          <h2>{cardId ? 'title' : 'Create New Card'}</h2>
          <button className="card-add-content-close" onClick={onClose}>x</button>
        </div>
        <div className="card-add-content-body">
          {/* Card Form */}
          <form onSubmit={cardId ? (e) => { e.preventDefault(); UpdateCard(); } : CreateCard}>
            <div className="card-add-content-field">
              <label htmlFor="title">Card Title</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter card title" required disabled={isLoading}/>
            </div>
            <div className="card-add-content-field">
              <label htmlFor="description">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter card description" rows={4} disabled={isLoading}/>
            </div>
            <div className="card-add-content-actions">
              <button type="submit" disabled={isLoading || !title.trim()}>
                {isLoading ? 'Saving...' : (cardId ? 'Update Card' : 'Create Card')}
              </button>
              {cardId && (
                <button type="button" onClick={DeleteCard} className="card-add-content-delete" disabled={isLoading}> Delete Card </button>
              )}
            </div>
          </form>

          {/* Cover Image Section */}
          {cardId && (
            <div className="card-add-content-section">
              <h3>Cover Image</h3>
              
              {card?.coverImage && (
                <div className="card-add-content-cover-preview">
                  <img src={card.coverImage} alt="Card cover" />
                  <button onClick={DeleteCover} className="card-add-content-delete-cover">
                    Remove Cover
                  </button>
                </div>
              )}
              
              <div className="card-add-content-file-upload">
                <input type="file" id="cover-upload" accept="image/*" onChange={FileUpload} disabled={isLoading}/>
                <label htmlFor="cover-upload">
                  {card?.coverImage ? 'Change Cover' : 'Add Cover'}
                </label>
              </div>
            </div>
          )}

          {/* Comments Section */}
          {cardId && (
            <div className="card-add-content-section">
              <h3>Comments</h3>
              
              <form onSubmit={AddComment} className="card-add-content-comment-form">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." rows={3}/>
                <button type="submit" disabled={!newComment.trim()}>
                  Add Comment
                </button>
              </form>

              <div className="card-add-content-comments">
                {comments.map((comment) => (
                  <div key={comment.id} className="card-add-content-comment">
                    <div className="card-add-content-comment-header">
                      <span className="card-add-content-comment-author">
                        {comment.user.name}
                      </span>
                      <span className="card-add-content-comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      <button onClick={() => DeleteComment(comment.id)} className="card-add-content-delete-comment">
                        Delete
                      </button>
                    </div>
                    <p className="card-add-content-comment-text">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};