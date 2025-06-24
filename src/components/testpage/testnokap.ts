// Заглушки для API функций для тестирования CardAddContent

export interface Card {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

// Временное хранилище данных
let mockCards: Card[] = [];
let mockComments: Comment[] = [];
let cardIdCounter = 1;
let commentIdCounter = 1;

// Функция для создания задержки (имитация сетевого запроса)
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Создание карточки
export const createCard = async (
  workspaceId: string,
  boardId: string,
  columnId: string,
  data: { title: string; description?: string }
): Promise<Card> => {
  await delay();
  
  const newCard: Card = {
    id: `card-${cardIdCounter++}`,
    title: data.title,
    description: data.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockCards.push(newCard);
  console.log('Mock API: Card created', newCard);
  return newCard;
};

// Получение карточки
export const getCard = async (
  workspaceId: string,
  boardId: string,
  columnId: string,
  cardId: string
): Promise<Card> => {
  await delay(200);
  
  const card = mockCards.find(c => c.id === cardId);
  if (!card) {
    throw new Error('Card not found');
  }
  
  console.log('Mock API: Card fetched', card);
  return card;
};

// Обновление карточки
export const updateCard = async (
  workspaceId: string,
  boardId: string,
  columnId: string,
  cardId: string,
  data: { title: string; description?: string }
): Promise<Card> => {
  await delay();
  
  const cardIndex = mockCards.findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    throw new Error('Card not found');
  }
  
  const updatedCard: Card = {
    ...mockCards[cardIndex],
    title: data.title,
    description: data.description,
    updatedAt: new Date().toISOString()
  };
  
  mockCards[cardIndex] = updatedCard;
  console.log('Mock API: Card updated', updatedCard);
  return updatedCard;
};

// Удаление карточки
export const deleteCard = async (
  workspaceId: string,
  boardId: string,
  columnId: string,
  cardId: string
): Promise<void> => {
  await delay();
  
  const cardIndex = mockCards.findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    throw new Error('Card not found');
  }
  
  mockCards.splice(cardIndex, 1);
  // Удаляем также все комментарии к этой карточке
  mockComments = mockComments.filter(c => c.id.split('-')[1] !== cardId);
  
  console.log('Mock API: Card deleted', cardId);
};

// Получение комментариев к карточке
export const getCardComments = async (
  workspaceId: string,
  boardId: string,
  columnId: string,
  cardId: string
): Promise<Comment[]> => {
  await delay(200);
  
  // Фильтруем комментарии по cardId (в реальном API это было бы по связи)
  const cardComments = mockComments.filter(c => c.id.includes(cardId));
  
  console.log('Mock API: Comments fetched for card', cardId, cardComments);
  return cardComments;
};

// Добавление комментария
export const addCardComment = async (
  workspaceId: string,
  boardId: string,
  columnId: string,
  cardId: string,
  text: string
): Promise<Comment> => {
  await delay();
  
  const newComment: Comment = {
    id: `comment-${cardId}-${commentIdCounter++}`,
    text,
    createdAt: new Date().toISOString(),
    user: {
      id: 'user-1',
      name: 'Test User'
    }
  };
  
  mockComments.push(newComment);
  console.log('Mock API: Comment added', newComment);
  return newComment;
};

// Удаление комментария
export const deleteComment = async (
  workspaceId: string,
  commentId: string
): Promise<void> => {
  await delay();
  
  const commentIndex = mockComments.findIndex(c => c.id === commentId);
  if (commentIndex === -1) {
    throw new Error('Comment not found');
  }
  
  mockComments.splice(commentIndex, 1);
  console.log('Mock API: Comment deleted', commentId);
};

// Загрузка обложки карточки
export const uploadCardCover = async (
  workspaceId: string,
  boardId: string,
  columnId: string,
  cardId: string,
  file: File
): Promise<Card> => {
  await delay(1000); // Имитируем более долгую загрузку файла
  
  const cardIndex = mockCards.findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    throw new Error('Card not found');
  }
  
  // Создаем URL для превью изображения
  const imageUrl = URL.createObjectURL(file);
  
  const updatedCard: Card = {
    ...mockCards[cardIndex],
    coverImage: imageUrl,
    updatedAt: new Date().toISOString()
  };
  
  mockCards[cardIndex] = updatedCard;
  console.log('Mock API: Cover uploaded for card', cardId, imageUrl);
  return updatedCard;
};

// Удаление обложки карточки
export const deleteCardCover = async (
  workspaceId: string,
  boardId: string,
  columnId: string,
  cardId: string
): Promise<void> => {
  await delay();
  
  const cardIndex = mockCards.findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    throw new Error('Card not found');
  }
  
  // Освобождаем URL объекта если он был создан
  if (mockCards[cardIndex].coverImage) {
    URL.revokeObjectURL(mockCards[cardIndex].coverImage!);
    mockCards[cardIndex].coverImage = undefined;
    mockCards[cardIndex].updatedAt = new Date().toISOString();
  }
  
  console.log('Mock API: Cover deleted for card', cardId);
};

// Функция для очистки мок-данных (полезно для тестирования)
export const clearMockData = () => {
  mockCards = [];
  mockComments = [];
  cardIdCounter = 1;
  commentIdCounter = 1;
  console.log('Mock API: Data cleared');
};