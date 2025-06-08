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

type Columns = Record<string, Card[]>;

type DroppableColumnProps = {
    columnId: string;
    cards: Card[];
    moveCard: (cardId: string, sourceColumn: string, targetColumn: string) => void;
    addCard: (columnId: string) => void;
};

type DraggableCardProps = {
    card: Card;
    columnId: string;
};

const BoardPage = () => {

    const [columns, setColumns] = useState<Columns>({
        backlog: [
            // { id: 'card-1', content: 'Task 1' },
            // { id: 'card-2', content: 'Task 2' },
        ],
        inProgress: [
        ],
        done: [
            // { id: 'card-4', content: 'Task 4' },
            // { id: 'card-5', content: 'Task 5' },
            // { id: 'card-6', content: 'Task 6' },
        ],
        todo: [
            // { id: 'card-7', content: 'Task 7' },
            // { id: 'card-8', content: 'Task 8' },
            // { id: 'card-9', content: 'Task 9' },
        ],
        finsh: [
            // { id: 'card-10', content: 'Task 10' },
            // { id: 'card-11', content: 'Task 11' },
            // { id: 'card-12', content: 'Task 12' },
        ],
        finsh1: [
            // { id: 'card-13', content: 'Task 13' },
            // { id: 'card-14', content: 'Task 14' },
            // { id: 'card-15', content: 'Task 15' },
        ],
        finsh3: [
            // { id: 'card-16', content: 'Task 16' },
            // { id: 'card-17', content: 'Task 17' },
            // { id: 'card-18', content: 'Task 18' },
        ],
    });

    const [cardCounter, setCardCounter] = useState(1);

    const moveCard = (cardId: string, sourceColumn: string, targetColumn: string) => {
        if (sourceColumn === targetColumn) return;

        const sourceCards = columns[sourceColumn].filter(card => card.id !== cardId);
        const movedCard = columns[sourceColumn].find(card => card.id === cardId);
        if (!movedCard) return;

        const targetCards = [...columns[targetColumn], movedCard];

        setColumns({
            ...columns,
            [sourceColumn]: sourceCards,
            [targetColumn]: targetCards,
        });
    };

    const addCard = (columnId: string) => {
        const newCard: Card = {
            id: `card-${cardCounter}`,
            content: `New Task ${cardCounter - 0}`
        };
        
        setColumns(prev => ({
            ...prev,
            [columnId]: [...prev[columnId], newCard]
        }));
        
        setCardCounter(prev => prev + 1);
    };

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
                        <div className="board-content">
                            {Object.entries(columns).map(([columnId, cards]) => (
                                <DroppableColumn key={columnId} columnId={columnId} cards={cards} moveCard={moveCard} addCard={addCard} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const DroppableColumn = ({ columnId, cards, moveCard, addCard }: DroppableColumnProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cleanup = dropTargetForElements({
            element: ref.current!,
            getData: () => ({ targetColumn: columnId }),
            onDrop: ({ source }) => {
                const { cardId, sourceColumn } = source.data as { cardId: string; sourceColumn: string };
                moveCard(cardId, sourceColumn, columnId);
            },
        });
        return () => cleanup();
    }, [columnId, moveCard]);

    const AddCard = () => {
        addCard(columnId);
    };

    return (
        <div ref={ref} className="board-column">
            <div className="board-object">
                <h3>{columnId}</h3>
                <button className="btn-setting-board-card">...</button>
            </div>
            <div className="board-cards">
                    {cards.map((card) => (
                        <DraggableCard key={card.id} card={card} columnId={columnId} />
                    ))}
            </div>
            <button className="addbtn-card-collum" onClick={AddCard}>+ add a card</button>                
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