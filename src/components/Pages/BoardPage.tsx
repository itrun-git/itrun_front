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
import { createColumn, getColumns, updateColumn, deleteColumn as deleteColumnAPI, moveColumn, copyColumn, createCard } from "../Api/api";

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
    moveCard: (cardId: string, sourceColumnId: string, targetColumnId: string) => void;
    addCard: (columnId: string) => void;
    deleteColumn: (columnId: string) => void;
    renameColumn: (columnId: string, newTitle: string) => void;
    copyColumn: (columnId: string) => void;
    onCardClick: (cardId: string, columnId: string) => void; // Новый проп
};

type DraggableCardProps = {
    card: Card;
    columnId: string;
    onCardClick: (cardId: string, columnId: string) => void; // Новый проп
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

    // Состояния для модального окна
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

    const loadColumns = async () => {
        if (!workspaceId || !boardId) {
            setError('Workspace ID or Board ID is missing');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            console.log('Loading columns for:', { workspaceId, boardId });
            
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
            
            columnsData.sort((a: Column, b: Column) => (a.position || 0) - (b.position || 0));
            setColumns(columnsData);
            console.log('Columns loaded:', columnsData);
        } catch (err) {
            console.error('Failed to load columns:', err);
            setError(err instanceof Error ? err.message : 'Failed to load columns');
        } finally {
            setLoading(false);
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

    // Обработчики для модального окна
    const CardCreated = (newCard: any) => {
        setColumns(prevColumns => prevColumns.map(column => 
            column.id === selectedColumnId 
                ? { 
                    ...column, 
                    cards: [...column.cards, {
                        id: newCard.id?.toString() || `card-${Date.now()}`,
                        content: newCard.description || newCard.title || 'Untitled Card',
                        title: newCard.title || '',
                        description: newCard.description || '',
                        position: typeof newCard.position === 'number' ? newCard.position : 0
                    }] 
                } 
                : column
        ));
        CloseModal();
    };

    const CardUpdated = (updatedCard: any) => {
        setColumns(prevColumns => prevColumns.map(column => 
            column.id === selectedColumnId 
                ? {
                    ...column,
                    cards: column.cards.map(card => 
                        card.id === updatedCard.id?.toString()
                            ? {
                                ...card,
                                content: updatedCard.description || updatedCard.title || 'Untitled Card',
                                title: updatedCard.title || '',
                                description: updatedCard.description || '',
                            }
                            : card
                    )
                }
                : column
        ));
    };

    const CardDeleted = (deletedCardId: string) => {
        setColumns(prevColumns => prevColumns.map(column => 
            column.id === selectedColumnId 
                ? {
                    ...column,
                    cards: column.cards.filter(card => card.id !== deletedCardId)
                }
                : column
        ));
        CloseModal();
    };

    const moveCard = (cardId: string, sourceColumn: string, targetColumn: string) => {
        if (sourceColumn === targetColumn) return;
        
        setColumns(prevColumns => {
            const newColumns = prevColumns.map(column => {
                if (column.id === sourceColumn) {
                    return {
                        ...column,
                        cards: column.cards.filter(card => card.id !== cardId),
                    };
                }
                if (column.id === targetColumn) {
                    const moveCard = prevColumns.find(col => col.id === sourceColumn)?.cards.find(c => c.id === cardId);
                    return moveCard ? { 
                        ...column, 
                        cards: [...column.cards, moveCard] 
                    } : column;
                }
                return column;
            });
            return newColumns;
        });

        console.log('Moving card:', { cardId, sourceColumn, targetColumn });
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
            setColumns(prevColumns => [...prevColumns, newColumn]);
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
            setColumns(prevColumns => prevColumns.map(column => 
                column.id === columnId ? { ...column, title: newTitle } : column
            ));
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
            setColumns(prevColumns => prevColumns.filter(column => column.id !== columnId));
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
            setColumns(prevColumns => [...prevColumns, copiedColumn]);
            console.log('Column copied successfully');
        } catch (err) {
            console.error('Failed to copy column:', err);
            setError(err instanceof Error ? err.message : 'Failed to copy column');
        }
    };

    const updateColumnPositions = async (movedColumns: Column[]) => {
        if (!workspaceId || !boardId) return;
        try {
            const columnsToUpdate = movedColumns.length > 0 ? movedColumns : columns;
            console.log('Updating column positions using moveColumn API');
            for (let i = 0; i < columnsToUpdate.length; i++) {
                const column = columnsToUpdate[i];
                if (column.position !== i) {
                    console.log(`Moving column ${column.id} to position ${i}`);
                    await moveColumn(workspaceId, boardId, column.id, i);
                }
            }
            console.log('Column positions updated successfully in database');
        } catch (err) {
            console.error('Failed to update column positions:', err);
            setError(err instanceof Error ? err.message : 'Failed to update column positions');
            loadColumns();
        }
    };

    const moveColumnLocally = (fromColumnId: string, toIndex: number) => {
        setColumns(prevColumns => {
            const fromIndex = prevColumns.findIndex(col => col.id === fromColumnId);
            if (fromIndex === -1) return prevColumns;
            const newColumns = [...prevColumns];
            const [movedColumn] = newColumns.splice(fromIndex, 1);
            newColumns.splice(toIndex, 0, movedColumn);
            return newColumns.map((col, index) => ({...col, position: index}));
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
                                <DroppableColumn key={column.id} column={column} moveCard={moveCard} addCard={addCard} deleteColumn={deleteColumn} renameColumn={renameColumn} 
                                    copyColumn={CopyColumn} moveColumn={moveColumnLocally} updateColumnPositions={updateColumnPositions} columnIndex={index} totalColumns={columns.length}
                                    onCardClick={CardClick}/>
                            ))}
                            <button className="create-column-btn" onClick={addColumn}>
                                + Add new column
                            </button> 
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно карточки */}
            {isModalOpen && workspaceId && boardId && selectedColumnId && (
                <CardAddContent workspaceId={workspaceId} boardId={boardId} columnId={selectedColumnId} cardId={selectedCardId || undefined} onClose={CloseModal} onCardCreated={CardCreated}
                    onCardUpdated={CardUpdated} onCardDeleted={CardDeleted}/>
            )}
        </>
    );
};

type ExtendedDroppableColumnProps = DroppableColumnProps & {
    moveColumn: (fromColumnId: string, toIndex: number) => void;
    updateColumnPositions: (columns: Column[]) => void;
    columnIndex: number;
    totalColumns: number;
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
    onCardClick
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
                return source.data.cardId !== undefined;
            },
            onDrop: ({ source }) => {
                const sourceData = source.data as { cardId?: string; sourceColumn?: string };
                const { cardId, sourceColumn } = sourceData;
                if (cardId && sourceColumn) {
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
                    setTimeout(() => {
                        updateColumnPositions([]);
                    }, 100);
                }
            },
        });

        const cleanDrag = draggable({ element: ref.current, getInitialData: () => ({ columnId: column.id }), onDragStart: () => setIsDragging(true), onDrop: () => setIsDragging(false),});
        return () => {cleanCardDrop(); cleanColumnDrop(); cleanDrag();};
    }, [column.id, columnIndex, moveCard, moveColumn, updateColumnPositions]);

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
        if (window.confirm(`Are you sure you want to delete "${column.title}" column?`)) {
            deleteColumn(column.id);
        }
        setIsMenuOpen(false);
    };

    const Copy = () => { copyColumn(column.id); setIsMenuOpen(false);};
    return (
        <div  ref={ref} className={`board-column ${isDragging ? 'dragging' : ''}`}>
            <div className="board-object">
                {isRenaming ? (
                    <div className="column-rename-container">
                        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onBlur={Rename} onKeyDown={KeyPress} className="column-rename-input" autoFocus/>
                    </div>
                ) : (
                    <h3>{column.title}</h3>
                )}
                <div className="column-menu-container">
                    <button className="btn-setting-board-card" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        ...
                    </button>
                    {isMenuOpen && (
                        <div className="column-menu">
                            <button className="column-menu-item" onClick={() => { setIsRenaming(true); setIsMenuOpen(false); }}>
                                Rename
                            </button>
                            <button className="column-menu-item" onClick={Copy}>
                                Copy
                            </button>
                            <button className="column-menu-item column-menu-delete" onClick={Delete}>
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="board-cards">
                {column.cards.map((card) => (
                    <DraggableCard key={card.id} card={card} columnId={column.id} onCardClick={onCardClick} />
                ))}
            </div>
            <button className="addbtn-card-collum" onClick={() => addCard(column.id)}>
                + add a card
            </button>
        </div>
    );
};

const DraggableCard = ({ card, columnId, onCardClick }: DraggableCardProps) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!ref.current) return;

        const cleanup = draggable({
            element: ref.current,
            getInitialData: () => ({ cardId: card.id, sourceColumn: columnId }),
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
        });
        return () => cleanup();
    }, [card.id, columnId]);

    const Click = () => {
        console.log(`Clicked on card: ${card.id} - ${card.content}`);
        onCardClick(card.id, columnId);
    };

    return (
        <button  ref={ref} className="board-card" type="button" onClick={Click}>
            <div className="card-content">
                {card.title && <div className="card-title">{card.title}</div>}
                <div className="card-description">{card.content}</div>
            </div>
        </button>
    );
};

export default BoardPage;