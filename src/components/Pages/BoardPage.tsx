import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "../Style/BoardPage.css";
import Header from "../Compo/header";
import planet from "../Logo/planet.png";
import borderstar from "../Logo/borderlight.png";
import tochka from "../Logo/tochka.png";
import WorkSpaceLeftBoard from "../Compo/WorkSpaceLeftBoard";
import { CardAddContent } from "../Compo/CardAddContent";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { createColumn, getColumns, updateColumn, deleteColumn as deleteColumnAPI, moveColumn, copyColumn, createCard, moveCard as moveCardAPI } from "../Api/api";

type Card = {
    id: string;
    content: string;
    title?: string;
    description?: string;
    position?: number;
};

type Column = {
    id: string;
    title: string;
    cards: Card[];
    position?: number;
    createdAt?: string;
    updatedAt?: string;
}

type DroppableColumnProps = {
    column: Column;
    moveCard: (cardId: string, sourceColumnId: string, targetColumnId: string, targetPosition?: number) => void;
    addCard: (columnId: string) => void;
    deleteColumn: (columnId: string) => void;
    renameColumn: (columnId: string, newTitle: string) => void;
    copyColumn: (columnId: string) => void;
    onCardClick: (cardId: string, columnId: string) => void;
};

type DraggableCardProps = {
    card: Card;
    columnId: string;
    cardIndex: number;
    onCardClick: (cardId: string, columnId: string) => void;
    reorderCardsInColumn: (columnId: string, fromIndex: number, toIndex: number) => void;
};

interface BoardPageProps {
    workspaceId?: string;
    boardId?: string;
}

const BoardPage: React.FC<BoardPageProps> = ({ 
    workspaceId: propWorkspaceId,
    boardId: propBoardId 
}) => {
    const params = useParams<{ workspaceId?: string; boardId?: string }>();
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [boardName, setBoardName] = useState("Kanban Template");
    const [activeTab, setActiveTab] = useState("boards");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
    const [isCreatingCard, setIsCreatingCard] = useState(false);

    const workspaceId = propWorkspaceId || params.workspaceId;
    const boardId = propBoardId || params.boardId;

    useEffect(() => {
        console.log('BoardPage params:', { workspaceId, boardId });
        if (!workspaceId || !boardId) {
            setError('Workspace ID or Board ID is missing');
            setLoading(false);
            return;
        }
        loadColumns();
    }, [workspaceId, boardId]);

    const getColumnOrderKey = (workspaceId: string, boardId: string) => {
        return `columnOrder_${workspaceId}_${boardId}`;
    };

    const getCardStateKey = (workspaceId: string, boardId: string) => {
        return `cardState_${workspaceId}_${boardId}`;
    };

  const loadColumns = async () => {
    if (!workspaceId || !boardId) {
        setError('Workspace ID or Board ID is missing');
        setLoading(false);
        return;
    }
    try {
        setLoading(true);
        setError(null);
        const localState = loadCardState(workspaceId, boardId);
        if (localState) {
            console.log('Using local card state');
            setColumns(localState);
            setLoading(false);
            return;
        }
        console.log('Loading columns from API:', { workspaceId, boardId });
        const response = await getColumns(workspaceId, boardId);
        console.log('Columns response:', response);
        let columnsData: Column[] = [];
        if (Array.isArray(response)) {
            columnsData = response.map((col: any) => ({
                id: col.id?.toString() || `col-${Date.now()}`,
                title: col.title || col.name || 'Untitled Column',
                position: typeof col.position === 'number' ? col.position : 0,
                cards: Array.isArray(col.cards) ? col.cards.map((card: any) => ({
                    id: card.id?.toString() || `card-${Date.now()}`,
                    content: card.content || card.description || card.title || 'Untitled Card',
                    title: card.title || '',
                    description: card.description || card.content || '',
                    position: typeof card.position === 'number' ? card.position : 0
                })) : [],
                createdAt: col.createdAt,
                updatedAt: col.updatedAt
            }));
        } else if (response && typeof response === 'object') {
            if (response.data && Array.isArray(response.data)) {
                columnsData = response.data.map((col: any) => ({
                    id: col.id?.toString() || `col-${Date.now()}`,
                    title: col.title || col.name || 'Untitled Column',
                    position: typeof col.position === 'number' ? col.position : 0,
                    cards: Array.isArray(col.cards) ? col.cards : [],
                    createdAt: col.createdAt,
                    updatedAt: col.updatedAt
                }));
            } else {
                console.warn('Unexpected response structure:', response);
                columnsData = [];
            }
        }
        
        const savedOrder = getColumnOrder(workspaceId, boardId);
        if (savedOrder && savedOrder.length > 0) {
            console.log('Applying saved column order:', savedOrder);
            const columnsMap = new Map(columnsData.map(col => [col.id, col]));
            const orderedColumns: Column[] = [];
            savedOrder.forEach(columnId => {
                const column = columnsMap.get(columnId);
                if (column) {
                    orderedColumns.push(column);
                    columnsMap.delete(columnId);
                }
            });
            columnsMap.forEach(column => {
                orderedColumns.push(column);
            });
            columnsData = orderedColumns;
        } else {
            columnsData.sort((a: Column, b: Column) => (a.position || 0) - (b.position || 0));
        }
        columnsData = columnsData.map((col, index) => ({ ...col, position: index }));
        setColumns(columnsData);
        saveCardState(workspaceId, boardId, columnsData);
        console.log('Columns loaded:', columnsData);
        } catch (err) {
            console.error('Failed to load columns:', err);
            setError(err instanceof Error ? err.message : 'Failed to load columns');
        } finally {
            setLoading(false);
        }
    };

    const saveCardState = (workspaceId: string, boardId: string, columns: Column[]) => {
        const key = getCardStateKey(workspaceId, boardId);
        const cardState = columns.map(col => ({
            id: col.id,
            title: col.title,
            position: col.position,
            cards: col.cards.map(card => ({
                id: card.id,
                content: card.content,
                title: card.title,
                description: card.description,
                position: card.position
            }))
        }));
        localStorage.setItem(key, JSON.stringify(cardState));
        console.log('Card state saved to localStorage:', cardState);
    };

    const loadCardState = (workspaceId: string, boardId: string): Column[] | null => {
        const key = getCardStateKey(workspaceId, boardId);
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                console.log('Card state loaded from localStorage:', parsed);
                return parsed;
            } catch (error) {
                console.error('Error parsing saved card state:', error);
                localStorage.removeItem(key);
            }
        }
        return null;
    };

    const saveColumnOrder = (workspaceId: string, boardId: string, columnIds: string[]) => {
        const key = getColumnOrderKey(workspaceId, boardId);
        localStorage.setItem(key, JSON.stringify(columnIds));
        console.log('Column order saved to localStorage:', { columnIds, key });
    };

    const getColumnOrder = (workspaceId: string, boardId: string): string[] | null => {
        const key = getColumnOrderKey(workspaceId, boardId);
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                console.log('Column order loaded from localStorage:', parsed);
                return parsed;
            } catch (error) {
                console.error('Error parsing saved column order:', error);
                localStorage.removeItem(key);
            }
        }
        return null;
    };
           
    const clearLocalState = () => {
        if (workspaceId && boardId) {
            const cardStateKey = getCardStateKey(workspaceId, boardId);
            const columnOrderKey = getColumnOrderKey(workspaceId, boardId);
            localStorage.removeItem(cardStateKey);
            localStorage.removeItem(columnOrderKey);
            console.log('localStorage state cleared');
            loadColumns();
        }
    };

    const CardClick = (cardId: string, columnId: string) => {
        setSelectedCardId(cardId);
        setSelectedColumnId(columnId);
        setIsCreatingCard(false);
        setIsModalOpen(true);
    };

    const CreateNewCard = (columnId: string) => {
        setSelectedCardId(null);
        setSelectedColumnId(columnId);
        setIsCreatingCard(true);
        setIsModalOpen(true);
    };

    const CloseModal = () => {
        setIsModalOpen(false);
        setSelectedCardId(null);
        setSelectedColumnId(null);
        setIsCreatingCard(false);
    };

    const CardCreated = (newCard: any) => {
        setColumns(prevColumns => {
            const newColumns = prevColumns.map(column => 
                column.id === selectedColumnId 
                    ? {  ...column, cards: [...column.cards, {
                            id: newCard.id?.toString() || `card-${Date.now()}`,
                            content: newCard.description || newCard.title || 'Untitled Card',
                            title: newCard.title || '',
                            description: newCard.description || '',
                            position: typeof newCard.position === 'number' ? newCard.position : column.cards.length
                        }] 
                    } : column
            );
            if (workspaceId && boardId) {
                saveCardState(workspaceId, boardId, newColumns);
            }
            return newColumns;
        });
        CloseModal();
    };

    const CardUpdated = (updatedCard: any) => {
        setColumns(prevColumns => {
            const newColumns = prevColumns.map(column => 
                column.id === selectedColumnId 
                    ? {
                        ...column,
                        cards: column.cards.map(card => 
                            card.id === updatedCard.id?.toString()
                                ? {...card, content: updatedCard.description || updatedCard.title || 'Untitled Card', title: updatedCard.title || '', description: updatedCard.description || '',}: card
                        )
                    } : column
            );
            
            if (workspaceId && boardId) {
                saveCardState(workspaceId, boardId, newColumns);
            }
            return newColumns;
        });
    };

    const CardDeleted = (deletedCardId: string) => {
        setColumns(prevColumns => {
            const newColumns = prevColumns.map(column => 
                column.id === selectedColumnId ? {...column, cards: column.cards.filter(card => card.id !== deletedCardId)}: column
            );
            if (workspaceId && boardId) {
                saveCardState(workspaceId, boardId, newColumns);
            }
            return newColumns;
        });
        CloseModal();
    };
        
    const moveCard = async (cardId: string, sourceColumn: string, targetColumn: string, targetPosition?: number) => {
        if (sourceColumn === targetColumn) {
            const sourceCol = columns.find(col => col.id === sourceColumn);
            if (sourceCol) {
                const cardIndex = sourceCol.cards.findIndex(card => card.id === cardId);
                if (cardIndex !== -1 && targetPosition !== undefined && cardIndex !== targetPosition) {
                    reorderCardsInColumn(sourceColumn, cardIndex, targetPosition);
                }
            }
            return;
        }
        setColumns(prevColumns => {
            let movedCard: Card | undefined;
            for (const column of prevColumns) {
                const foundCard = column.cards.find(card => card.id === cardId);
                if (foundCard) {
                    movedCard = foundCard;
                    break;
                }
            }
            if (!movedCard) {
                console.error('Card not found:', cardId);
                return prevColumns;
            }
            const newColumns = prevColumns.map(column => {
                const filteredCards = column.cards.filter(card => card.id !== cardId);
                if (column.id === targetColumn) {
                    const newPosition = targetPosition !== undefined ? targetPosition : filteredCards.length;
                    const newCards = [...filteredCards];
                    newCards.splice(newPosition, 0, { ...movedCard, position: newPosition });
                    return { ...column, cards: newCards.map((card, index) => ({ ...card, position: index }))
                    };
                } else {
                    return { ...column, cards: filteredCards };
                }
            });
            if (workspaceId && boardId) {
                saveCardState(workspaceId, boardId, newColumns);
            }
            return newColumns;
        });
        try {
            if (workspaceId) {
                const targetColumnData = columns.find(col => col.id === targetColumn);
                const newPosition = targetColumnData ? targetColumnData.cards.length : 0;
                await moveCardAPI(workspaceId, cardId, targetColumn, newPosition);
                console.log('Card moved successfully on server:', { cardId, sourceColumn, targetColumn, newPosition });
            }
        } catch (error) {
            console.error('Failed to move card on server:', error);
            setError('Failed to sync card movement with server');
        }
    };

    const reorderCardsInColumn = (columnId: string, fromIndex: number, toIndex: number) => {
        setColumns(prevColumns => {
            const newColumns = prevColumns.map(column => {
                if (column.id === columnId) {
                    const newCards = [...column.cards];
                    const [movedCard] = newCards.splice(fromIndex, 1);
                    newCards.splice(toIndex, 0, movedCard);
                    const updatedCards = newCards.map((card, index) => ({
                        ...card,
                        position: index
                    }));
                    return { ...column, cards: updatedCards };
                }
                return column;
            });
            
            if (workspaceId && boardId) {
                saveCardState(workspaceId, boardId, newColumns);
            }
            return newColumns;
        });
    };

    const addCard = async (columnId: string) => {
        CreateNewCard(columnId);
    };

    const addColumn = async () => {
        if (!workspaceId || !boardId) {
            setError('Workspace ID or Board ID is missing');
            return;
        }
        try {
            const newColumnData = {
                name: `New column ${columns.length + 1}` 
            };
            console.log('Creating column:', newColumnData);
            const response = await createColumn(workspaceId, boardId, newColumnData);
            console.log('Column created:', response);
            const newColumn: Column = {
                id: response.id?.toString() || `col-${Date.now()}`,
                title: response.title || response.name || newColumnData.name, 
                position: typeof response.position === 'number' ? response.position : columns.length,
                cards: Array.isArray(response.cards) ? response.cards : []
            };
            setColumns(prevColumns => {
                const newColumns = [...prevColumns, newColumn];
                if (workspaceId && boardId) {
                    saveCardState(workspaceId, boardId, newColumns);
                    const columnIds = newColumns.map(col => col.id);
                    saveColumnOrder(workspaceId, boardId, columnIds);
                }
                return newColumns;
            });
        } catch (err) {
            console.error('Failed to create column:', err);
            setError(err instanceof Error ? err.message : 'Failed to create column');
        }
    };

    const renameColumn = async (columnId: string, newTitle: string) => {
        if (!newTitle.trim() || !workspaceId || !boardId) return;
        
        try {
            console.log('Renaming column:', { columnId, newTitle });
            const response = await updateColumn(workspaceId, boardId, columnId, { name: newTitle }); 
            console.log('Column rename response:', response);
            setColumns(prevColumns => {
                const newColumns = prevColumns.map(column => 
                    column.id === columnId ? { ...column, title: newTitle } : column
                );
                if (workspaceId && boardId) {
                    saveCardState(workspaceId, boardId, newColumns);
                }
                return newColumns;
            });
            console.log('Column renamed successfully');
        } catch (err) {
            console.error('Failed to rename column:', err);
            setError(err instanceof Error ? err.message : 'Failed to rename column');
            loadColumns();
        }
    };

    const deleteColumn = async (columnId: string) => {
        if (!workspaceId || !boardId) {
            setError('Workspace ID or Board ID is missing');
            return;
        }
        try {
            console.log('Deleting column:', columnId);
            await deleteColumnAPI(workspaceId, boardId, columnId);
            
            setColumns(prevColumns => {
                const newColumns = prevColumns.filter(column => column.id !== columnId);
                if (workspaceId && boardId) {
                    saveCardState(workspaceId, boardId, newColumns);
                    const columnIds = newColumns.map(col => col.id);
                    saveColumnOrder(workspaceId, boardId, columnIds);
                }
                return newColumns;
            });
            console.log('Column deleted successfully');
        } catch (err) {
            console.error('Failed to delete column:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete column');
        }
    };

    const CopyColumn = async (columnId: string) => {
        if (!workspaceId || !boardId) {
            setError('Workspace ID or Board ID is missing');
            return;
        }
        try {
            console.log('Copying column:', columnId);
            const response = await copyColumn(workspaceId, boardId, columnId);
            console.log('Column copy response:', response);
            const copiedColumn: Column = {
                id: response.id?.toString() || `col-${Date.now()}`,
                title: response.title || 'Copied Column',
                position: typeof response.position === 'number' ? response.position : columns.length,
                cards: Array.isArray(response.cards) ? response.cards : []
            };
            setColumns(prevColumns => {
                const newColumns = [...prevColumns, copiedColumn];
                if (workspaceId && boardId) {
                    saveCardState(workspaceId, boardId, newColumns);
                    const columnIds = newColumns.map(col => col.id);
                    saveColumnOrder(workspaceId, boardId, columnIds);
                }
                return newColumns;
            });
            console.log('Column copied successfully');
        } catch (err) {
            console.error('Failed to copy column:', err);
            setError(err instanceof Error ? err.message : 'Failed to copy column');
        }
    };

    const updateColumnPositions = async (newColumns: Column[]) => {
        if (workspaceId && boardId) {
            const columnIds = newColumns.map(col => col.id);
            saveColumnOrder(workspaceId, boardId, columnIds);
            saveCardState(workspaceId, boardId, newColumns);
            console.log('Column positions updated locally:', columnIds);
        }
    };

    const moveColumnLocally = (fromColumnId: string, toIndex: number) => {
    setColumns(prevColumns => {
        const fromIndex = prevColumns.findIndex(col => col.id === fromColumnId);
        if (fromIndex === -1) return prevColumns;
        const newColumns = [...prevColumns];
        const [movedColumn] = newColumns.splice(fromIndex, 1);
        newColumns.splice(toIndex, 0, movedColumn);
        const updatedColumns = newColumns.map((col, index) => ({
            ...col, 
            position: index
        }));
        if (workspaceId && boardId) {
            const columnIds = updatedColumns.map(col => col.id);
            saveColumnOrder(workspaceId, boardId, columnIds);
            saveCardState(workspaceId, boardId, updatedColumns);
        }
        
        return updatedColumns;
        });
    };

    if (loading) {
        return (
            <div className="BoardBody">
                <Header />
                <div className="board-main-content">
                    <div className="board-left-otstup">
                        <WorkSpaceLeftBoard activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                    <div className="board-right-content">
                        <div className="loading-state">
                            Loading columns...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!workspaceId || !boardId) {
        return (
            <div className="BoardBody">
                <Header />
                <div className="board-main-content">
                    <div className="board-left-otstup">
                        <WorkSpaceLeftBoard activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                    <div className="board-right-content">
                        <div className="error-state">
                            <strong>Error:</strong> Workspace ID or Board ID is missing from URL
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="BoardBody">
                <Header />
                <div className="board-main-content">
                    <div className="board-left-otstup">
                        <WorkSpaceLeftBoard activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                    <div className="board-right-content">
                        <div className="board-header-content">
                            <div className="board-header">
                                <span className="name-board-header">{boardName}</span>
                                <img className="str-header-board" src={borderstar} alt="border star" />
                                <img className="planet-header-board" src={planet} alt="planet" />
                                <button className="btn-board-header">Board</button>
                            </div>
                            <div className="board-header-left">
                                <button className="tochka-btn">
                                    <img className="planet-header-board-lft" src={tochka} alt="dots" />
                                </button>
                                <button onClick={clearLocalState} className="clear-state-btn">
                                    Clear Local State
                                </button>
                            </div>
                        </div>
                        
                        {error && (
                            <div className="error-message">
                                <strong>Error:</strong> {error}
                                <button onClick={loadColumns} className="error-retry-btn">
                                    Retry
                                </button>
                            </div>
                        )}
                        
                        <div className="board-content">
                            {columns.map((column, index) => (
                                <DroppableColumn key={column.id} column={column} moveCard={moveCard} addCard={addCard} deleteColumn={deleteColumn} renameColumn={renameColumn} copyColumn={CopyColumn} moveColumn={moveColumnLocally} 
                                updateColumnPositions={updateColumnPositions} columnIndex={index} totalColumns={columns.length}onCardClick={CardClick}setColumns={setColumns} reorderCardsInColumn={reorderCardsInColumn}/>
                            ))}
                            <button className="create-column-btn" onClick={addColumn}> + Add new column</button> 
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно карточки */}
            {isModalOpen && workspaceId && boardId && selectedColumnId && (
                <CardAddContent workspaceId={workspaceId} boardId={boardId} columnId={selectedColumnId} cardId={selectedCardId || undefined} onClose={CloseModal} onCardCreated={CardCreated}onCardUpdated={CardUpdated} onCardDeleted={CardDeleted}/>
            )}
        </>
    );
};

type ExtendedDroppableColumnProps = DroppableColumnProps & {
    moveColumn: (fromColumnId: string, toIndex: number) => void;
    updateColumnPositions: (columns: Column[]) => void;
    columnIndex: number;
    totalColumns: number;
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>; 
    reorderCardsInColumn: (columnId: string, fromIndex: number, toIndex: number) => void;
};

const DroppableColumn = ({ 
    column, 
    moveCard, 
    addCard, 
    deleteColumn, 
    renameColumn, 
    copyColumn,
    moveColumn,
    updateColumnPositions,
    columnIndex,
    totalColumns,
    onCardClick,
    setColumns,
    reorderCardsInColumn
}: ExtendedDroppableColumnProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newTitle, setNewTitle] = useState(column.title);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setNewTitle(column.title);
    }, [column.title]);

    useEffect(() => {
        if (!ref.current) return;

        const cleanCardDrop = dropTargetForElements({
            element: ref.current,
            getData: () => ({ targetColumnId: column.id }),
            canDrop: ({ source }) => {
                const sourceData = source.data as { cardId?: string; sourceColumn?: string };
                return sourceData.cardId !== undefined && sourceData.sourceColumn !== column.id;
            },
            onDrop: ({ source }) => {
                const sourceData = source.data as { cardId?: string; sourceColumn?: string };
                const { cardId, sourceColumn } = sourceData;
                if (cardId && sourceColumn && sourceColumn !== column.id) {
                    console.log('Card dropped:', { cardId, sourceColumn, targetColumn: column.id });
                    moveCard(cardId, sourceColumn, column.id);
                }
            },
        });

        const cleanColumnDrop = dropTargetForElements({
            element: ref.current,
            getData: () => ({ columnId: column.id, columnIndex }),
            canDrop: ({ source }) => {
                return source.data.columnId !== undefined && source.data.cardId === undefined;
            },
            onDrop: ({ source }) => {
                const sourceData = source.data as { columnId?: string };
                const { columnId: sourceColumnId } = sourceData;
                if (sourceColumnId && sourceColumnId !== column.id) {
                    console.log('Column dropped:', { sourceColumnId, targetIndex: columnIndex });
                    moveColumn(sourceColumnId, columnIndex);
                }
            },
        });

        const cleanDrag = draggable({ 
            element: ref.current, 
            getInitialData: () => ({ columnId: column.id }), 
            onDragStart: () => setIsDragging(true), 
            onDrop: () => setIsDragging(false),
        });
        
        return () => {
            cleanCardDrop(); 
            cleanColumnDrop(); 
            cleanDrag();
        };
    }, [column.id, columnIndex, moveCard, moveColumn, updateColumnPositions, setColumns]);

    const Rename = () => {
        if (newTitle.trim() && newTitle !== column.title) {
            renameColumn(column.id, newTitle.trim());
        }
        setIsRenaming(false);
        setIsMenuOpen(false);
    };

    const KeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            Rename();
        } else if (e.key === 'Escape') {
            setNewTitle(column.title);
            setIsRenaming(false);
        }
    };

    const Delete = () => {
        if (
            // window.confirm
            (`Are you sure you want to delete "${column.title}" column?`)) {
            deleteColumn(column.id);
        }
        setIsMenuOpen(false);
    };

    const Copy = () => { 
        copyColumn(column.id); 
        setIsMenuOpen(false);
    };
    
    return (
        <div ref={ref} className={`board-column ${isDragging ? 'dragging' : ''}`}>
            <div className="board-object">
                {isRenaming ? (
                    <div className="column-rename-container">
                        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onBlur={Rename} onKeyDown={KeyPress} className="column-rename-input" autoFocus/>
                    </div>
                ) : (
                    <h3>{column.title}</h3>
                )}
                <div className="column-menu-container">
                    <button className="btn-setting-board-card" onClick={() => setIsMenuOpen(!isMenuOpen)}> ...</button>
                    {isMenuOpen && (
                        <div className="column-menu">
                            <button className="column-menu-item" onClick={() => { setIsRenaming(true); setIsMenuOpen(false); }}>Rename</button>
                            <button className="column-menu-item" onClick={Copy}>Copy</button>
                            <button className="column-menu-item column-menu-delete" onClick={Delete}>Delete</button>
                        </div>
                    )}
                </div>
            </div>
            <DroppableCardsContainer column={column} moveCard={moveCard} onCardClick={onCardClick} reorderCardsInColumn={reorderCardsInColumn} />
            {/* <div className="board-cards">
                {column.cards.map((card, cardIndex) => (
                    <DraggableCard key={card.id} card={card} columnId={column.id} cardIndex={cardIndex} onCardClick={onCardClick} reorderCardsInColumn={reorderCardsInColumn} />
                ))}
            </div> */}
            <button className="addbtn-card-collum" onClick={() => addCard(column.id)}> + add a card</button>
        </div>
    );
};

const DraggableCard = ({ card, columnId, cardIndex, onCardClick, reorderCardsInColumn }: DraggableCardProps) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    useEffect(() => {
        if (!ref.current) return;
       
        const cleanDrag = draggable({
            element: ref.current,
            getInitialData: () => ({ 
                cardId: card.id, 
                sourceColumn: columnId,
                sourceCardIndex: cardIndex
            }),
            onDragStart: () => {
                setIsDragging(true);
            },
            onDrop: () => {setTimeout(() => setIsDragging(false), 200);},
        });
        return () => {
            cleanDrag();
        };
    }, [card.id, columnId, cardIndex, reorderCardsInColumn]);
    const Click = () => {
        if (isDragging) return;
        console.log(`Clicked on card: ${card.id} - ${card.content}`);
        onCardClick(card.id, columnId);
    };
    const renderCardContent = () => {
        const hasTitle = card.title && card.title.trim() !== '';
        const hasDescription = card.description && card.description.trim() !== '';
        const hasContent = card.content && card.content.trim() !== '';

        if (hasTitle && !hasDescription && !hasContent) {
            return <div className="card-title">{card.title}</div>;
        }
        if (hasTitle && (hasDescription || hasContent)) {
            return (
                <>
                    <div className="card-title">{card.title}</div>
                    <div className="card-description">...</div>
                </>
            );
        }
        if (!hasTitle && (hasDescription || hasContent)) {
            return <div className="card-description">...</div>;
        }
        return <div className="card-description">{card.content || 'Untitled Card'}</div>;
    };
    return (
        <button ref={ref} className={`board-card ${isDragging ? 'dragging' : ''}`} type="button" onClick={Click}>
            <div className="card-content">
                {renderCardContent()}
            </div>
        </button>
    );
};
const DroppableCardsContainer = ({ column, moveCard, onCardClick, reorderCardsInColumn }: {
    column: Column;
    moveCard: (cardId: string, sourceColumn: string, targetColumn: string, targetPosition?: number) => void;
    onCardClick: (cardId: string, columnId: string) => void;
    reorderCardsInColumn: (columnId: string, fromIndex: number, toIndex: number) => void;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const cleanDrop = dropTargetForElements({
            element: ref.current,
            getData: () => ({ targetColumnId: column.id }),
            canDrop: ({ source }) => {
                const sourceData = source.data as { cardId?: string; sourceColumn?: string };
                return sourceData.cardId !== undefined;
            },  
            onDrop: ({ source, location }) => {
                const sourceData = source.data as { cardId?: string; sourceColumn?: string };
                const { cardId, sourceColumn } = sourceData;
                if (cardId && sourceColumn && sourceColumn !== column.id) {
                    const dropTarget = location.current.dropTargets[0];
                    const rect = ref.current?.getBoundingClientRect();
                    const mouseY = location.current.input.clientY;
                    let targetPosition = column.cards.length;
                    if (rect && mouseY) {
                        const cardElements = ref.current?.querySelectorAll('.board-card');
                        if (cardElements && cardElements.length > 0) {
                                for (let i = 0; i < cardElements.length; i++) {
                                const cardRect = cardElements[i].getBoundingClientRect();
                                const cardMiddle = cardRect.top + cardRect.height / 2;
                                if (mouseY < cardMiddle) {
                                    targetPosition = i;
                                    break;
                                }
                            }
                        }
                    }
                    console.log('Card dropped into cards container:', { cardId, sourceColumn, targetColumn: column.id, targetPosition });
                    moveCard(cardId, sourceColumn, column.id, targetPosition);
                }
            },
        });

        return () => {
            cleanDrop();
        };
    }, [column.id, moveCard]);

    return (
        <div ref={ref} className="board-cards">
            {column.cards.map((card, cardIndex) => (
                <DraggableCard key={card.id} card={card} columnId={column.id}  cardIndex={cardIndex} onCardClick={onCardClick} reorderCardsInColumn={reorderCardsInColumn} />
            ))}
        </div>
    );
};
export default BoardPage;