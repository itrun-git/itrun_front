import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
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
import settings from "../Logo/settings.png";
import spisok from "../Logo/spisok.png";
import member from "../Logo/member.png";
import board from "../Logo/board.png";

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
  const [showWorkspaceBoard, setShowWorkspaceBoard] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [selectedWorkspaceName, setSelectedWorkspaceName] = useState<string>('My Workspace');
  const [selectedWorkspaceImage, setSelectedWorkspaceImage] = useState<string | undefined>(undefined);

  //Навигация на воркспейс
  const navigate = useNavigate();
  const handleTabClick = () => {
    navigate('/workspace');
  };

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
  const [starredBoards, setStarredBoard ]= useState([
    { className: 'purple', label: 'Marketing', isStarred: true },
    { className: 'olive', label: 'DevOps', isStarred: true },
    { className: 'darkblue', label: 'Design', isStarred: true },
    // { className: 'blue', label: 'Sales', isStarred: true },
    // { className: 'green', label: 'Team Sync', isStarred: true },
  ]);

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

  // выбор избранного шаблона
  const toggleStarred = (index: number) => {
    setStarredBoard (prev => prev.map((board, i) =>
    i === index ? {...board, isStarred: !board.isStarred} : board));
  };

  const getWorkspaceInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Универсальный компонент секции с досками
  const BoardSection = ({
    image,
    title,
    boards,
    currentIndex,
    showAll,
    onToggleShowAll,
    onLeft,
    onRight,
    sectionKey,
  }: {
    image?: string;
    title: string;
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
      <div className="section">
        <div className="board-section-header">
          {image && <img src={image} alt="section icon" className="board-section-image" />}
          <h2 className="board-section-title">{title}</h2>
        </div>
        <div className="template-section">
          <div className={`template-scroll ${showAll ? 'expanded' : ''}`}>
            {visibleBoards.map((board, index) => (
              <div
                className={`template-card ${board.className} ${!showAll && index === 3 ? 'faded' : ''}`}
                key={`${sectionKey}-${index}`}>
                  <div className='card-content-template'>
                    {board.label || 'Board'}
                    {sectionKey === 'starred' && (<img src={board.isStarred ? star : starlight}
                    alt = "star"
                    className='star-icon-content'
                    onClick={() => toggleStarred(currentIndex + index)}/>)}
                  </div>
              </div>
            ))}
          </div>

          {canScroll && (
           <div className="controls-container">
            <div className="left-block">
              <button className="show-all-btn" onClick={onToggleShowAll}>
              {showAll ? 'Hide All' : 'Open all'}
              </button>
            </div>

            {!showAll && (
            <div className="center-buttons">
              <button className="arrow-btn" onClick={onLeft}>
              <img src={leftarrow} alt="Left Arrow" />
              </button>
              <button className="arrow-btn" onClick={onRight}>
              <img src={rightarrow} alt="Right Arrow" />
              </button>
            </div>
          )}
          </div>

          )}
        </div>
      </div>
    );
  };

  const handleCloseBoard = () => setShowCentralBoard(false);
  const handleHiddenBoard = () => setShowCentralBoard(false);
  const handleItRunClick = () => {
    setShowCentralBoard(true);
    setShowWorkspaceBoard(false);
  };
  const handleWorkspaceClick = () => {
    setShowWorkspaceBoard(true);
    setShowCentralBoard(false);
  };
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
            <UserWorkSpace onWorkspaceClick={(data) => { handleWorkspaceClick(); setSelectedWorkspaceName(data.name); setSelectedWorkspaceImage(data.imageUrl); }} />
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

              <BoardSection
                title=""
                boards={templates}
                currentIndex={suggestedIndex}
                showAll={suggestedShowAll}
                onToggleShowAll={() => setSuggestedShowAll(!suggestedShowAll)}
                onLeft={() => scrollByArrow(-1, suggestedIndex, setSuggestedIndex, templates.length)}
                onRight={() => scrollByArrow(1, suggestedIndex, setSuggestedIndex, templates.length)}
                sectionKey="suggested"/>
            </div>

            {/* Starred Boards */}
            <BoardSection image={star}
              title="Starred boards"
              boards={starredBoards}
              currentIndex={starredIndex}
              showAll={starredShowAll}
              onToggleShowAll={() => setStarredShowAll(!starredShowAll)}
              onLeft={() => scrollByArrow(-1, starredIndex, setStarredIndex, starredBoards.length)}
              onRight={() => scrollByArrow(1, starredIndex, setStarredIndex, starredBoards.length)}
              sectionKey="starred"/>

            {/* Recently Viewed */}
            <BoardSection
              title="Recently viewed"
              image={timer}
              boards={recentBoards}
              currentIndex={recentIndex}
              showAll={recentShowAll}
              onToggleShowAll={() => setRecentShowAll(!recentShowAll)}
              onLeft={() => scrollByArrow(-1, recentIndex, setRecentIndex, recentBoards.length)}
              onRight={() => scrollByArrow(1, recentIndex, setRecentIndex, recentBoards.length)}
              sectionKey="recent"/>
           
            <div className="bottom-controls">
              <button className="control-btn" onClick={handleCloseBoard}>Closed boards</button>
              <button className="control-btn" onClick={handleHiddenBoard}>Hidden boards</button>
            </div>
          </div>
        )}

        {/* Workspace Board */}
        {showWorkspaceBoard && (
          <div className="central-side">
            <div className="workspace-board">
              <div className="header-row">
                <div className="header-left">
                  {selectedWorkspaceImage ? (
                    <img src={selectedWorkspaceImage} alt="Workspace Avatar" className="workspace-avatar-board workspace-avatar-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <span className="workspace-avatar-board">
                      {getWorkspaceInitials(selectedWorkspaceName)}
                    </span>
                  )}
                  <span className='userworkboard'>{selectedWorkspaceName}</span>
                </div>

                <div className="workspace-tabs">
                  <button className="tab-btn-wsp" onClick={handleTabClick}>
                    <span className='btn-logo-gap'>
                      <img src={board} className='btn-logo-wsp' alt="Boards" />
                    </span>
                    Boards
                  </button>
                  <button className="tab-btn-wsp" onClick={handleTabClick}>
                    <span className='btn-logo-gap'>
                      <img src={spisok} className='btn-logo-wsp' alt="Views" />
                    </span>
                    Views
                  </button>
                  <button className="tab-btn-wsp" onClick={handleTabClick}>
                    <span className='btn-logo-gap'>
                      <img src={member} className='btn-logo-wsp' alt="Members" />
                    </span>
                    Members
                  </button>
                  <button className="tab-btn-wsp" onClick={handleTabClick}>
                    <span className='btn-logo-gap'>
                      <img src={settings} className='btn-logo-wsp' alt="Settings" />
                    </span>
                    Settings
                  </button>
                </div>
              </div>
              <div className="workspace-content">
                <div className="board-item starred">
                  <div className="board-preview basic-board">
                    <span className="star-icon"><img src={starlight} alt="Star" /></span>
                  </div>
                  <span className="board-name">Basic Board</span>
                </div>

                <div className="board-item create-new">
                  <div className="board-preview create-board">
                    <span className="plus-icon">+</span>
                  </div>
                  <span className="board-name">Create new board</span>
                </div>
              </div>
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