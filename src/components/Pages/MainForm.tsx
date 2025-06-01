import React, { useState } from 'react';
import Header from '../Compo/header';
import UserWorkSpace from '../Compo/UserWorkSpace';
import '../Style/MainFrom.css';
import LogoIcon from "../Logo/LogoIcon.png";
import home from "../Logo/home.png";
import table from "../Logo/table.png";
import leftarrow from "../Logo/leftarrow.png";
import rightarrow from "../Logo/rightarrow.png";
import timer from "../Logo/timer.png";
import star from "../Logo/star.png";
import starlight from "../Logo/starlight.png";  

const MainForm = () => {
  // Suggested templates
  const [suggestedShowAll, setSuggestedShowAll] = useState(false);
  const [suggestedIndex, setSuggestedIndex] = useState(0);

  // Starred boards
  const [starredShowAll, setStarredShowAll] = useState(false);
  const [starredIndex, setStarredIndex] = useState(0);

  // Recently viewed
  const [recentShowAll, setRecentShowAll] = useState(false);
  const [recentIndex, setRecentIndex] = useState(0);

  const [showCentralBoard, setShowCentralBoard] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Основные шаблоны (Suggested)
  const templates = [
    { className: 'green', label: 'Basic Board' },
    { className: 'blue' },
    { className: 'darkblue' },
    { className: 'purple' },
    { className: 'navy' },
    { className: 'olive' },
    { className: 'maroon' },
  ];

  // Избранные доски
  const starredBoards = [
    { className: 'purple', label: 'Marketing' },
    { className: 'olive', label: 'DevOps' },
    { className: 'darkblue', label: 'Design' },
    // { className: 'blue', label: 'Sales' },
    // { className: 'green', label: 'Team Sync' },
  ];

  // Недавние доски
  const recentBoards = [
    { className: 'navy', label: 'Plans' },
    { className: 'olive', label: 'Roadmap' },
    { className: 'maroon', label: 'Team' },
    { className: 'black', label: 'Sprint' },
    { className: 'purple', label: 'UX Research' },
  ];

  // Прокрутка для каждой секции
  const scrollByArrow = (direction: number, index: number, setter: React.Dispatch<React.SetStateAction<number>>, listLength: number) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex <= listLength - 4) {
      setter(newIndex);
    }
  };

  // Универсальный компонент секции с досками
  const BoardSection = ({
    title,
    image,
    boards,
    currentIndex,
    showAll,
    onToggleShowAll,
    onLeft,
    onRight,
    sectionKey,
  }: {
    title: string;
    image?: string;
    boards: any[];
    currentIndex: number;
    showAll: boolean;
    onToggleShowAll: () => void;
    onLeft: () => void;
    onRight: () => void;
    sectionKey: string;
  }) => {
    const visibleBoards = showAll ? boards : boards.slice(currentIndex, currentIndex + 4);
    const canScroll = boards.length > 3;

    return (
      <div className="board-section">
        <div className="board-section-header">
          <h2>{title}</h2>
          {image && <img src={image} alt="section icon"/>}
        </div>
        <div className="template-section">
          <div className={`template-scroll ${showAll ? 'expanded' : ''}`}>
            {visibleBoards.map((board, index) => (
              <div
                className={`template-card ${board.className} ${!showAll && index === 3 ? 'faded' : ''}`}
                key={`${sectionKey}-${index}`}
              >
                {board.label || 'Board'}
              </div>
            ))}
          </div>

          {canScroll && (
            <div className="controls-container">
              {!showAll && (
                <>
                  <button className="arrow-btn" onClick={onLeft}>
                    <img src={leftarrow} alt="Left Arrow" />
                  </button>
                  <button className="arrow-btn" onClick={onRight}>
                    <img src={rightarrow} alt="Right Arrow" />
                  </button>
                </>
              )}
              <button className="show-all-btn" onClick={onToggleShowAll}>
                {showAll ? 'Hide All' : 'Show All'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleCloseBoard = () => setShowCentralBoard(false);
  const handleHiddenBoard = () => setShowCentralBoard(false);
  const handleItRunClick = () => setShowCentralBoard(true);
  const openTemplateWindow = (label?: string) => label && setSelectedTemplate(label);
  const closeTemplateWindow = () => setSelectedTemplate(null);

  return (
    <div className="main-page">
      <Header />
      <div className="main-content">
        <div className="left-side">
          <div className="navigation-block">
            <button className="btn-grp active" onClick={handleItRunClick}>
              <span className="btn-icon-logo"><img src={LogoIcon} alt="ItRun Logo" className='btnleftside' /></span>
              Run
            </button>
            <button className="btn-grp">
              <span className="btn-icon"><img src={table} alt="Table" className='btnleftside' /></span>
              Templates
            </button>
            <button className="btn-grp">
              <span className="btn-icon"><img src={home} alt="Home" className='btnleftside' /></span>
              Home
            </button>
          </div>
          <div className="workspace-block">
            <UserWorkSpace />
          </div>
        </div>

        {showCentralBoard && (
          <div className="central-side">
            {/* Suggested Templates */}
            <div className="suggested-templates">
              <div className="header-row">
                <div className="header-left">
                  <img src={LogoIcon} alt="ItRun Logo" className="logo" />
                  <h2>Suggested templates</h2>
                </div>
                <button className="close-button" onClick={handleCloseBoard}>✕</button>
              </div>
              <p className="subtext">Get going faster with a template from itRun community</p>

              <BoardSection title=""
                boards={templates}
                currentIndex={suggestedIndex}
                showAll={suggestedShowAll}
                onToggleShowAll={() => setSuggestedShowAll(!suggestedShowAll)}
                onLeft={() => scrollByArrow(-1, suggestedIndex, setSuggestedIndex, templates.length)}
                onRight={() => scrollByArrow(1, suggestedIndex, setSuggestedIndex, templates.length)}
                sectionKey="suggested"
              />
            </div>

            {/* Starred Boards */}
            <BoardSection title="Starred boards" 
              image= {star}
              boards={starredBoards}
              currentIndex={starredIndex}
              showAll={starredShowAll}
              onToggleShowAll={() => setStarredShowAll(!starredShowAll)}
              onLeft={() => scrollByArrow(-1, starredIndex, setStarredIndex, starredBoards.length)}
              onRight={() => scrollByArrow(1, starredIndex, setStarredIndex, starredBoards.length)}
              sectionKey="starred"
            />

            {/* Recently Viewed */}
            <BoardSection title=" Recently viewed"
              image= {timer}
              boards={recentBoards}
              currentIndex={recentIndex}
              showAll={recentShowAll}
              onToggleShowAll={() => setRecentShowAll(!recentShowAll)}
              onLeft={() => scrollByArrow(-1, recentIndex, setRecentIndex, recentBoards.length)}
              onRight={() => scrollByArrow(1, recentIndex, setRecentIndex, recentBoards.length)}
              sectionKey="recent"
            />

            <div className="bottom-controls">
              <button className="control-btn" onClick={handleCloseBoard}>Closed boards</button>
              <button className="control-btn" onClick={handleHiddenBoard}>Hidden boards</button>
            </div>
          </div>
        )}

        {/* Окно шаблона */}
        {selectedTemplate && (
          <div className="template-window">
            <div className="template-window-content">
              <span className="close-window" onClick={closeTemplateWindow}>✕</span>
              <h2>{selectedTemplate}</h2>
              <p>This is a detailed description for the selected template.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainForm;