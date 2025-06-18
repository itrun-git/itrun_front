import React, { useState, useEffect, useRef } from "react";
import "../Style/BoardPage.css";
import Header from "../Compo/header";
import planet from "../Logo/planet.png";
import borderstar from "../Logo/borderlight.png";
import tochka from "../Logo/tochka.png";
import WorkSpaceLeftBoard from "../Compo/WorkSpaceLeftBoard";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

type Card = {
    id: string;
    content: string;
};

type Column = {
    id: string;
    title: string;
    cards: Card[];
}

type DroppableColumnProps = {
    column: Column;
    moveCard: (cardId: string, sourceColumnId: string, targetColumnId: string) => void;
    addCard: (columnId: string) => void;
    deleteColumn: (columnId: string) => void;
    renameColumn: (columnId: string, newTitle: string) => void;
};

type DraggableCardProps = {
    card: Card;
    columnId: string;
};

const BoardPage = () => {
    const [columns, setColumns] = useState<Column[]>([
        {id: "backlog", title: 'Baclog', cards: []},
        {id: "InProgress", title: 'InProgress', cards: []},
        {id: "done", title: 'done', cards: []},
        {id: "todo", title: 'todo', cards: []},
    ]);

    const [cardCounter, setCardCounter] = useState(1);
    const [columnCounter, setColumnCounter] = useState(5);

    const moveCard = (cardId: string, sourceColumn: string, targetColumn: string) => {
        if (sourceColumn === targetColumn) return;
        setColumns(prevColumns => {
            const newColumns = prevColumns.map(column => {
                if (column.id === sourceColumn){
                    return {
                        ...column,
                        cards: column.cards.filter(card => card.id !== cardId),
                    };
                }
                if (column.id === targetColumn){
                    const moveCard = prevColumns.find(col => col.id === sourceColumn)?.cards.find( c => c.id === cardId);
                    return moveCard ? {...column, cards: [...column.cards, moveCard ]} : column;
                }
                return column;
            });
            return newColumns;
        });
    };

    const addCard = (columnId: string) => {
        const newCard: Card = {
            id: `card-${cardCounter}`,
            content: `New Task ${cardCounter}`,
        };
        
        setColumns(prevColumns => prevColumns.map(column => (
            column.id === columnId ? {...column, cards: [...column.cards, newCard]} : column
        )));
        setCardCounter(prev => prev + 1);
    };

    const addColumn = () => {
        const newColumn: Column = {
            id: `column-${columnCounter}`,
            title: `New column ${columnCounter}`,
            cards: []
        };
        setColumns(prevColumns => [...prevColumns, newColumn]);
        setColumnCounter(prev => prev + 1);
    };

    const deleteColumn = (columnId: string) => {
        setColumns(prevColumns => prevColumns.filter(column => column.id !== columnId));
    };

    const renameColumn = (columnId: string, newTitle: string) => {
        setColumns(prevColumns => prevColumns.map(column => column.id === columnId ? {...column, title: newTitle}: column));
    };

    const boardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cleanup = dropTargetForElements({
            element: boardRef.current!,
            getData: ({ source })=> ({ fromColumnId: source.data.columnId }),
            onDrop: ({ source, location }) => {
                const fromId = source.data.columnId;
                const beforeId = (location as any)?.data?.columnId;
                if (!fromId || fromId === beforeId) return;
                setColumns( prev => {
                    const moving = prev.find(col => col.id === fromId);
                    const filtered = prev.filter(col => col.id !== fromId);
                    const index = beforeId ? filtered.findIndex(col => col.id === beforeId): filtered.length;
                    if (!moving) return prev;
                    const newCols = [...filtered.slice(0, index), moving, ...filtered.slice(index)];
                    return newCols;
                });
            },
        });
        return () => cleanup();
    }, []);

    return (
        <>
            <div className="BoardBody">
                <Header />
                <div className="board-main-content">
                    <WorkSpaceLeftBoard activeTab={"boards"} setActiveTab={() => {}} />
                    <div className="board-right-content">
                        <div className="board-header-content">
                            <div className="board-header">
                                <span className="name-board-header">Kanban Template</span>
                                {/* <button className="btn-tmp-header">Template</button> */}
                                <img className="str-header-board" src={borderstar} />
                                <img className="planet-header-board" src={planet} />
                                <button className="btn-board-header">Board</button>
                            </div>
                            <div className="board-header-left">
                                <button className="tochka-btn">
                                    <img className="planet-header-board-lft" src={tochka} />
                                </button>
                            </div>
                        </div>
                        <div className="board-content" ref = {boardRef}>
                            {columns.map(column => (<DroppableColumn key={column.id} column={column} moveCard={moveCard} addCard={addCard} deleteColumn={deleteColumn} renameColumn={renameColumn}/>))}
                            <button className="create-column-btn" onClick={addColumn}>
                                + Add new column
                            </button> 
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const DroppableColumn = ({ column, moveCard, addCard, deleteColumn, renameColumn }: DroppableColumnProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newTitle, setNewTitle] = useState(column.title);

    useEffect(() => {
        const cleanDrop = dropTargetForElements({
            element: ref.current!,
            getData: () => ({ targetColumnId: column.id }),
            onDrop: ({ source }) => {
                const { cardId, sourceColumn } = source.data as { cardId: string; sourceColumn: string };
                if(cardId && sourceColumn) moveCard(cardId, sourceColumn, column.id);
            },
        });

        const cleanDrag = draggable({
            element: ref.current!,
            getInitialData: () => ({ columnId: column.id}),
        });

        return () => {
            cleanDrop();
            cleanDrag();
        } 
    }, [column.id, moveCard]);

    const handleRename = () => {
        if (newTitle.trim() && newTitle !== column.title) {
            renameColumn(column.id, newTitle.trim());
        }
        setIsRenaming(false);
        setIsMenuOpen(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRename();
        } else if (e.key === 'Escape') {
            setNewTitle(column.title);
            setIsRenaming(false);
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${column.title}" column?`)) {
            deleteColumn(column.id);
        }
        setIsMenuOpen(false);
    };

     return (
        <div ref={ref} className="board-column">
            <div className="board-object">
                {isRenaming ? (
                    <div className="column-rename-container">
                        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onBlur={handleRename} onKeyDown={handleKeyPress} className="column-rename-input" autoFocus />
                    </div>
                ) : (
                    <h3>{column.title}</h3>
                )}
                <div>
                    <button  className="btn-setting-board-card" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        ...
                    </button>
                    {isMenuOpen && (
                        <div className="column-menu">
                            <button className="column-menu-item" onClick={() => { setIsRenaming(true); setIsMenuOpen(false);}}>
                                Rename
                            </button>
                            <button className="column-menu-item column-menu-delete" onClick={handleDelete} >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="board-cards">
                {column.cards.map((card) => (
                    <DraggableCard key={card.id} card={card} columnId={column.id} />
                ))}
            </div>
            <button className="addbtn-card-collum" onClick={() => addCard(column.id)}>+ add a card</button>                
        </div>
    );
};

const DraggableCard = ({ card, columnId }: DraggableCardProps) => {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const cleanup = draggable({
            element: ref.current!,
            getInitialData: () => ({ cardId: card.id, sourceColumn: columnId }),
        });
        return () => cleanup();
    }, [card.id, columnId]);

    const Click = () => {
        console.log(`Click on card: ${card.id} - ${card.content}`);
        //заглушка
    }

    return (
        <button ref={ref} className="board-card" type="button" onClick={Click}>
            {card.content}
        </button>
    );
};

export default BoardPage;