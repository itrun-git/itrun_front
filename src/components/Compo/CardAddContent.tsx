import React, { useState, useEffect } from 'react';
import '../Style/CardAddContent.css';
import delet from '../Logo/delet.png';
import addfile from '../Logo/addfile.png';
import { Card, Comment, createCard, getCard, updateCard, deleteCard, getCardComments, addCardComment,  deleteComment, uploadCardCover, deleteCardCover,moveCard,getCardMembers,addCardMember,removeCardMember,subscribeToCard,unsubscribeFromCard,getCardLabels, toggleCardLabel,updateCardDeadline,uploadCardAttachment, getCardAttachments, deleteCardAttachment, getCardAttachmentsCount} from '../Api/api';

interface CardAddContentProps {
  workspaceId: string;
  boardId: string;
  columnId: string;
  cardId?: string;
  deadline?: { date: string; isCompleted: boolean;};
  onClose: () => void;
  onCardCreated?: (card: Card) => void;
  onCardUpdated?: (card: Card) => void;
  onCardDeleted?: (cardId: string) => void;
  onCardMoved?: (cardId: string, newColumnId: string) => void;
  availableColumns?: Array<{ id: string; title: string }>;
  availableMembers?: Array<{ id: string; name: string; avatar?: string }>;
  availableLabels?: Array<{ id: string; name: string; color: string }>;
}

const truncateText = (text: string, maxLength: number = 150) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const CardAddContent: React.FC<CardAddContentProps> = ({
  workspaceId,
  boardId,
  columnId,
  cardId,
  onClose,
  onCardCreated,
  onCardUpdated,
  onCardDeleted,
  onCardMoved,
  availableColumns = [],
  availableMembers = [],
  availableLabels = []
}) => {
  const [card, setCard] = useState<Card | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [cardMembers, setCardMembers] = useState<any[]>([]);
  const [cardLabels, setCardLabels] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(columnId);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineCompleted, setDeadlineCompleted] = useState(false);

  const [showMemberSelector, setShowMemberSelector] = useState(false);
  const [showLabelSelector, setShowLabelSelector] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  useEffect(() => {
    if (cardId) {
      loadCard();
      loadComments();
      loadCardMembers();
      loadCardLabels();
      loadAttachments();
    }
  }, [cardId]);

  const loadCard = async () => {
    if (!cardId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const cardData = await getCard(workspaceId, boardId, columnId, cardId);
      setCard(cardData);
      setTitle(cardData.title);
      setDescription(cardData.description || '');
      if (cardData.deadline) {
        setDeadlineDate(cardData.deadline.date || '');
        setDeadlineCompleted(cardData.deadline.isCompleted || false);
      }
    } catch (error) {
      console.error('Failed to load card:', error);
      setError(error instanceof Error ? error.message : 'Failed to load card');
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    if (!cardId) return;
    try {
      const commentsData = await getCardComments(workspaceId, boardId, columnId, cardId);
      if (Array.isArray(commentsData)) {
        setComments(commentsData);
      } else if (commentsData && Array.isArray((commentsData as any).comments)) {
        setComments((commentsData as any).comments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    }
  };

  const loadCardMembers = async () => {
    if (!cardId) return;
    try {
      const members = await getCardMembers(cardId);
      if (Array.isArray(members)) {
        setCardMembers(members);
      } else {
        console.warn('Members data is not an array:', members);
        setCardMembers([]);
      }
    } catch (error) {
      console.error('Failed to load card members:', error);
      setCardMembers([]); 
    }
  };

  const loadCardLabels = async () => {
    if (!cardId) return;
    try {
      const labels = await getCardLabels(cardId);
      if (Array.isArray(labels)) {
        setCardLabels(labels);
      } else {
        console.warn('Labels data is not an array:', labels);
        setCardLabels([]);
      }
    } catch (error) {
      console.error('Failed to load card labels:', error);
      setCardLabels([]);
    }
  };

  const loadAttachments = async () => {
    if (!cardId) return;
    try {
      const attachmentsData = await getCardAttachments(workspaceId, boardId, columnId, cardId);
      if (Array.isArray(attachmentsData)) {
        setAttachments(attachmentsData);
      } else {
        console.warn('Attachments data is not an array:', attachmentsData);
        setAttachments([]);
      }
    } catch (error) {
      console.error('Failed to load attachments:', error);
      setAttachments([]);
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
      console.error('Failed to create card:', error);
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
      setIsEditingTitle(false);
      setIsEditingDescription(false);
    } catch (error) {
      console.error('Failed to update card:', error);
      setError(error instanceof Error ? error.message : 'Failed to update card');
    } finally {
      setIsLoading(false);
    }
  };

  const DeleteCard = async () => {
    if (!cardId) return;
    // if (!window.confirm('Are you sure you want to delete this card?')) return;
    try {
      setIsLoading(true);
      setError(null);
      await deleteCard(workspaceId, boardId, columnId, cardId);
      onCardDeleted?.(cardId);
      onClose();
    } catch (error) {
      console.error('Failed to delete card:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete card');
    } finally {
      setIsLoading(false);
    }
  };

  const MoveCard = async (newColumnId: string) => {
    if (!cardId || newColumnId === columnId) return;
    try {
      await moveCard(workspaceId, cardId, newColumnId);
      onCardMoved?.(cardId, newColumnId);
      setSelectedColumnId(newColumnId);
      setShowColumnSelector(false);
    } catch (error) {
      console.error('Failed to move card:', error);
      setError(error instanceof Error ? error.message : 'Failed to move card');
    }
  };

  const AddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId || !newComment.trim()) return;
    try {
      const commentData = {
        text: newComment.trim(),
        createdAt: new Date().toISOString()
      };
      const comment = await addCardComment(workspaceId, boardId, columnId, cardId, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };
  

  const DeleteComment = async (commentId: string) => {
    if (!cardId) return;
    // if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(workspaceId, boardId, columnId, cardId, commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete comment');
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
      console.error('Failed to upload file:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  const AttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cardId) return;
    try {
      setIsLoading(true);
      const attachment = await uploadCardAttachment(workspaceId, boardId, columnId, cardId, file);
      setAttachments(prev => [...prev, attachment]);
      loadAttachments();
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload attachment');
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
      console.error('Failed to delete cover:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete cover');
    }
  };

  const DeleteAttachment = async (attachmentId: string) => {
    if (!cardId) return;
    // if (!window.confirm('Are you sure you want to delete this attachment?')) return;
    try {
      await deleteCardAttachment(workspaceId, cardId, attachmentId);
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete attachment');
    }
  };

  const AddMember = async (userId: string) => {
    if (!cardId) return;
    try {
      await addCardMember(workspaceId, cardId, userId);
      loadCardMembers();
      setShowMemberSelector(false);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const RemoveMember = async (userId: string) => {
    if (!cardId) return;
    try {
      await removeCardMember(workspaceId, cardId, userId);
      loadCardMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const ToggleLabel = async (labelId: string) => {
    if (!cardId) return;
    try {
      await toggleCardLabel(cardId, labelId);
      loadCardLabels();
    } catch (error) {
      console.error('Failed to toggle label:', error);
    }
  };

  const UpdateDeadline = async () => {
    if (!cardId) return;
    try {
      await updateCardDeadline(workspaceId, boardId, columnId, cardId, {
        date: deadlineDate,
        isCompleted: deadlineCompleted
      });
      setShowDatePicker(false);
      loadCard();
    } catch (error) {
      console.error('Failed to update deadline:', error);
      setError(error instanceof Error ? error.message : 'Failed to update deadline');
    }
  };

  const Subscribe = async () => {
    if (!cardId) return;
    try {
      await subscribeToCard(cardId);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  const Unsubscribe = async () => {
    if (!cardId) return;
    try {
      await unsubscribeFromCard(cardId);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  if (!cardId) {
    return (
      <div className="card-add-content">
        <div className="card-add-content-overlay" onClick={onClose}></div>
        
        <div className="card-add-content-modal">
          <div className="card-add-content-header">
            <h2>Create New Card</h2>
            <button className="card-add-content-close" onClick={onClose}>×</button>
          </div>
          
          {error && (
            <div className="card-add-content-error">
              {error}
            </div>
          )}
          
          <div className="card-add-content-body">
            <form onSubmit={CreateCard}>
              <div className="card-add-content-field">
                <label htmlFor="title">Card Title</label>
                <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter card title" required disabled={isLoading}className="rounded-input"/>
              </div>
              <div className="card-add-content-field">
                <label htmlFor="description">Description</label>
                <input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter card description" disabled={isLoading}className="rounded-input"/>
              </div>
              <div className="card-add-content-actions">
                <button type="submit" disabled={isLoading || !title.trim()}>
                  {isLoading ? 'Creating...' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !card) {
    return (
      <div className="card-detail-modal" onClick={onClose}>
        <div className="card-detail-content" onClick={(e) => e.stopPropagation()}>
          <button className="card-detail-close" onClick={onClose}>×</button>
          <div className="loading-state">
            Loading card details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-detail-modal" onClick={onClose}>
      <div className="card-detail-wrapper">
      <div className="card-detail-content" onClick={(e) => e.stopPropagation()}>
        <button className="card-detail-close" onClick={onClose}>×</button>
        
        {error && (
          <div className="card-add-content-error">
            {error}
          </div>
        )}
        
        {/* Cover Image - размер 80x80 */}
        {card?.coverImage && (
          <div className="card-cover-container">
            <img src={card.coverImage} alt="Card cover" className="card-cover-image" />
            <button onClick={DeleteCover} className="delete-cover-btn">Remove Cover</button>
          </div>
        )}
        
        <div className="card-detail-header">
          <div className="card-detail-main">
            {isEditingTitle ? (
              <div className="title-edit-container">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={UpdateCard} onKeyDown={(e) => { if (e.key === 'Enter') UpdateCard();
                    if (e.key === 'Escape') {
                      setTitle(card?.title || '');
                      setIsEditingTitle(false);
                    }
                  }}
                  className="title-edit-input rounded-input"
                  autoFocus/>
              </div>
            ) : (
              <h1 className="card-detail-title" onClick={() => setIsEditingTitle(true)}>
                {card?.title || title}
              </h1>
            )}
          </div>
        </div>

        <div className="card-detail-layout">
          <div className="card-detail-body">
            {/* Labels */}
            {Array.isArray(cardLabels) && cardLabels.length > 0 && (
              <div className="card-section">
                <h3>Labels</h3>
                <div className="labels-container">
                  {cardLabels.map(label => (
                    <span key={label.id} className="card-label">
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            {Array.isArray(cardMembers) && cardMembers.length > 0 && (
              <div className="card-section">
                <h3>Members</h3>
                <div className="members-container">
                  {cardMembers.map(member => (
                    <div key={member.id} className="card-member">
                      {member.avatar && <img src={member.avatar} alt={member.name} />}
                      <span>{member.name}</span>
                      <button onClick={() => RemoveMember(member.id)}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deadline */}
            {card?.deadline && (
              <div className="card-section">
                <h3>Due Date</h3>
                <div className="deadline-container">
                  <span className={`deadline ${deadlineCompleted ? 'completed' : ''}`}>
                    {new Date(card.deadline.date).toLocaleDateString()}
                  </span>
                  {deadlineCompleted && <span className="completed-badge">Complete</span>}
                </div>
              </div>
            )}

            {/* Description с обрезкой текста */}
            <div className="card-section">
              <h3>Description</h3>
              {isEditingDescription ? (
                <div className="description-edit-container">
                  <input value={description} onChange={(e) => setDescription(e.target.value)} className="description-edit-textarea rounded-input"/>
                  <div className="description-edit-actions">
                    <button onClick={UpdateCard} disabled={isLoading}>Save</button>
                    <button onClick={() => {
                      setDescription(card?.description || '');
                      setIsEditingDescription(false);
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="card-description" onClick={() => setIsEditingDescription(true)}>
                  {description ? (
                    <>
                      <p className="description-text">
                        {showFullDescription ? description : truncateText(description)}
                      </p>
                      {description.length > 150 && (
                        <button className="description-toggle-btn" onClick={(e) => { e.stopPropagation(); setShowFullDescription(!showFullDescription);}} >
                          {showFullDescription ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="description-placeholder">Add a description...</p>
                  )}
                </div>
              )}
            </div>

            {/* Attachments */}
            {/* {Array.isArray(attachments) && attachments.length > 0 && (
              <div className="card-section">
                <h3>Attachments ({attachmentsCount})</h3>
                <div className="attachments-container">
                  {attachments.map(attachment => (
                    <div key={attachment.id} className="attachment-item">
                      <span>{attachment.filename}</span>
                      <button onClick={() => DeleteAttachment(attachment.id)}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {/* Comments */}
            <div className="card-section">
              <h3>Comments</h3>
              <form onSubmit={AddComment} className="add-comment-form">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="comment-input"/>
              <button type="submit" className="comment-button"> Add Comment </button>
              </form>
              
             <div className="comments-list">
                {Array.isArray(comments) && comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-content">
                      <div className="comment-author">
                        {comment.author?.fullName || comment.author?.email || 'Unknown User'}
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      <div className="comment-actions">
                        <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleString()}
                        </span>
                        <button onClick={() => DeleteComment(comment.id)} className="comment-delete-btn">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Attachments */}
            {Array.isArray(attachments) && attachments.length > 0 && (
              <div className="card-section">
                <div className="attachments-container">
                  {attachments.map(attachment => (
                    <div className="attachment-item">
                      {(attachment.fullUrl || attachment.url) && attachment.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <div className="attachment-image-container">
                        <img src={attachment.fullUrl || attachment.url} alt={attachment.filename} onClick={() => setSelectedImage(attachment.fullUrl || attachment.url)} className="attachment-image"/>
                        <button onClick={() => DeleteAttachment(attachment.id)} className="attachment-delete-btn">Delete</button>
                      </div>
                      ) : (
                      <div className="attachment-file-container">
                        <span className="attachment-filename">{attachment.filename}</span>
                        <button onClick={() => DeleteAttachment(attachment.id)} className="attachment-delete-btn">Delete</button>
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

       {/* Sidebar */}
          <div className="card-detail-sidebar">
            <h3>Add to Card</h3>
            <div className="sidebar-item" onClick={(e) => e.stopPropagation()}>
              <label htmlFor="file-upload" className="sidebar-item-label">
                <img src={addfile}/>Add File
              </label>
              <input id="file-upload" type="file" accept="image/*" onChange={AttachmentUpload} style={{ display: 'none' }}/>
            </div>
            <h3>Actions</h3>
            <div className="sidebar-item sidebar-item-danger" onClick={DeleteCard}>
                <img src={delet}/>
              Delete
            </div>
          </div>
        </div>
    </div>
  );
};