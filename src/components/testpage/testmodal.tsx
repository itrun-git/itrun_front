import React, { useState } from 'react';
import { CardAddContent } from '../Compo/CardAddContent';

// Заглушки для типов
interface Card {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

const TestModal: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Заглушка для создания карточки
  const handleCardCreated = (card: Card) => {
    console.log('Card created:', card);
    setCards(prev => [...prev, card]);
    setShowCreateModal(false);
  };

  // Заглушка для обновления карточки
  const handleCardUpdated = (card: Card) => {
    console.log('Card updated:', card);
    setCards(prev => prev.map(c => c.id === card.id ? card : c));
    setShowEditModal(false);
  };

  // Заглушка для удаления карточки
  const handleCardDeleted = (cardId: string) => {
    console.log('Card deleted:', cardId);
    setCards(prev => prev.filter(c => c.id !== cardId));
    setShowEditModal(false);
  };

  // Открытие карточки для редактирования
  const openCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setShowEditModal(true);
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <h1>Test Modal Page - CardAddContent</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Create New Card
        </button>
      </div>

      {/* Список созданных карточек */}
      <div>
        <h2>Created Cards ({cards.length})</h2>
        {cards.length === 0 ? (
          <p style={{ color: '#666' }}>No cards created yet. Click "Create New Card" to start.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {cards.map(card => (
              <div 
                key={card.id}
                onClick={() => openCard(card.id)}
                style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {card.coverImage && (
                  <img 
                    src={card.coverImage} 
                    alt="Card cover" 
                    style={{ 
                      width: '100%', 
                      height: '120px', 
                      objectFit: 'cover', 
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}
                  />
                )}
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{card.title}</h3>
                {card.description && (
                  <p style={{ 
                    margin: '0', 
                    color: '#666', 
                    fontSize: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {card.description}
                  </p>
                )}
                <small style={{ color: '#999', fontSize: '12px' }}>
                  Created: {new Date(card.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно для создания карточки */}
      {showCreateModal && (
        <CardAddContent
          workspaceId="test-workspace"
          boardId="test-board"
          columnId="test-column"
          onClose={() => setShowCreateModal(false)}
          onCardCreated={handleCardCreated}
        />
      )}

      {/* Модальное окно для редактирования карточки */}
      {showEditModal && selectedCardId && (
        <CardAddContent
          workspaceId="test-workspace"
          boardId="test-board"
          columnId="test-column"
          cardId={selectedCardId}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCardId(null);
          }}
          onCardUpdated={handleCardUpdated}
          onCardDeleted={handleCardDeleted}
        />
      )}

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h3>Инструкция по тестированию:</h3>
        <ul>
          <li>Нажмите "Create New Card" чтобы открыть модальное окно создания</li>
          <li>Заполните название и описание, нажмите "Create Card"</li>
          <li>Созданная карточка появится в списке ниже</li>
          <li>Кликните на любую карточку чтобы открыть её для редактирования</li>
          <li>В режиме редактирования доступны: изменение данных, загрузка обложки, комментарии, удаление</li>
        </ul>
        <p><strong>Примечание:</strong> Все API заглушены, данные хранятся только в памяти компонента</p>
      </div>
    </div>
  );
};

export default TestModal;